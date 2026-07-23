import type { Vehicle } from "../types";

interface VehicleCardProps {
  vehicle: Vehicle;
  onPurchase: (id: string) => void;
  purchaseLoading: string | null;
  isLoggedIn: boolean;
}

export const VehicleCard = ({ vehicle, onPurchase, purchaseLoading, isLoggedIn }: VehicleCardProps) => {
  const isOutOfStock = vehicle.quantity === 0;
  const isLowStock = vehicle.quantity > 0 && vehicle.quantity <= 3;
  const isPurchasing = purchaseLoading === vehicle.id;

  return (
    <div
      className={`group relative flex flex-col rounded-lg border bg-asphalt-800 p-5 transition-all duration-200 ${
        isOutOfStock ? "border-asphalt-700 opacity-60" : "border-asphalt-700 hover:border-ignition/60"
      }`}
    >
      {/* Status corner tag */}
      {isOutOfStock ? (
        <span className="absolute right-4 top-4 rounded-[4px] bg-asphalt-700 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-chrome-500">
          Sold
        </span>
      ) : isLowStock ? (
        <span className="absolute right-4 top-4 rounded-[4px] bg-ignition/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ignition">
          {vehicle.quantity} left
        </span>
      ) : null}

      <span className="plate-dark w-fit">{vehicle.category}</span>

      <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-chrome-100">
        {vehicle.make} <span className="text-chrome-500">{vehicle.model}</span>
      </h3>

      <div className="mt-auto pt-5">
        <div className="mb-4 flex items-end justify-between">
          <span className="font-mono text-xl font-bold text-chrome-100">
            ${vehicle.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
          <span className="font-mono text-xs text-chrome-500">{vehicle.quantity} in stock</span>
        </div>

        {isLoggedIn ? (
          <button
            onClick={() => onPurchase(vehicle.id)}
            disabled={isOutOfStock || isPurchasing}
            className={`focus-ring w-full rounded-md py-2.5 text-sm font-bold uppercase tracking-wide transition-all ${
              isOutOfStock
                ? "cursor-not-allowed bg-asphalt-700 text-chrome-500"
                : isPurchasing
                  ? "cursor-wait bg-ignition/70 text-asphalt-900"
                  : "bg-ignition text-asphalt-900 hover:bg-ignition-600 active:scale-[0.98]"
            }`}
          >
            {isPurchasing ? "Processing…" : isOutOfStock ? "Out of Stock" : "Purchase"}
          </button>
        ) : (
          <div className="rounded-md border border-dashed border-asphalt-600 py-2.5 text-center text-sm text-chrome-500">
            Login to purchase
          </div>
        )}
      </div>
    </div>
  );
};
