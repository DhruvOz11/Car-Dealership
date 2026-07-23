interface StatsBarProps {
  total: number;
  outOfStock: number;
  lowStock: number;
  categories: number;
}

const StatCard = ({ label, value, accent }: { label: string; value: number; accent: string }) => (
  <div className="rounded-lg border border-asphalt-700 bg-asphalt-800 p-4">
    <p className={`font-mono text-3xl font-bold ${accent}`}>{value}</p>
    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-chrome-500">{label}</p>
  </div>
);

export const StatsBar = ({ total, outOfStock, lowStock, categories }: StatsBarProps) => (
  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
    <StatCard label="Total Vehicles" value={total} accent="text-chrome-100" />
    <StatCard label="Out of Stock" value={outOfStock} accent="text-red-400" />
    <StatCard label="Low Stock (≤3)" value={lowStock} accent="text-ignition" />
    <StatCard label="Categories" value={categories} accent="text-emerald-400" />
  </div>
);
