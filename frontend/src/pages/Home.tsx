import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/auth.context";
import { useVehicles } from "../hooks/useVehicles";
import { VehicleCard } from "../components/VehicleCard";
import { SearchFilters } from "../components/SearchFilters";
import { StatsBar } from "../components/StatsBar";
import { Navbar } from "../components/Navbar";

const Home = () => {
  const { user } = useAuth();
  const { vehicles, loading, error, fetchVehicles, purchaseVehicle, purchaseLoading, setError } = useVehicles();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    void fetchVehicles();
  }, [fetchVehicles]);

  const categories = useMemo(() => Array.from(new Set(vehicles.map((v) => v.category))).sort(), [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        const q = [v.make, v.model, v.category].join(" ").toLowerCase();
        const matchSearch = search.trim() ? q.includes(search.toLowerCase()) : true;
        const matchCategory = category ? v.category === category : true;
        const matchMin = minPrice ? v.price >= Number(minPrice) : true;
        const matchMax = maxPrice ? v.price <= Number(maxPrice) : true;
        return matchSearch && matchCategory && matchMin && matchMax;
      })
      .sort((a, b) => a.make.localeCompare(b.make));
  }, [vehicles, search, category, minPrice, maxPrice]);

  const stats = useMemo(
    () => ({
      total: vehicles.length,
      outOfStock: vehicles.filter((v) => v.quantity === 0).length,
      lowStock: vehicles.filter((v) => v.quantity > 0 && v.quantity <= 3).length,
      categories: categories.length,
    }),
    [vehicles, categories],
  );

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="min-h-screen bg-asphalt-900">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-chrome-100">
            Vehicle Inventory
          </h1>
          <p className="mt-1 text-chrome-500">Browse the lot. Tap Purchase to reserve a vehicle.</p>
        </div>

        <StatsBar {...stats} />

        <SearchFilters
          search={search}
          category={category}
          minPrice={minPrice}
          maxPrice={maxPrice}
          categories={categories}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onReset={handleReset}
          resultCount={filteredVehicles.length}
        />

        {error && (
          <div className="flex items-center justify-between rounded-md border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-semibold hover:text-red-100">
              Dismiss
            </button>
          </div>
        )}

        {!user && (
          <div className="rounded-md border border-ignition/30 bg-ignition/10 px-4 py-3 text-sm text-chrome-100">
            Viewing as a guest.{" "}
            <a href="/login" className="font-semibold text-ignition underline">
              Log in
            </a>{" "}
            to purchase vehicles.
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-lg border border-asphalt-700 bg-asphalt-800" />
            ))}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-asphalt-600 py-20">
            <p className="font-display text-xl uppercase tracking-wide text-chrome-500">No vehicles found</p>
            <p className="mt-1 text-sm text-chrome-500">Try adjusting your filters</p>
            <button
              onClick={handleReset}
              className="focus-ring mt-4 rounded-md bg-ignition px-4 py-2 text-sm font-bold uppercase text-asphalt-900 hover:bg-ignition-600"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onPurchase={(id) => void purchaseVehicle(id)}
                purchaseLoading={purchaseLoading}
                isLoggedIn={!!user}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
