interface SearchFiltersProps {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  categories: string[];
  onSearchChange: (val: string) => void;
  onCategoryChange: (val: string) => void;
  onMinPriceChange: (val: string) => void;
  onMaxPriceChange: (val: string) => void;
  onReset: () => void;
  resultCount: number;
}

const inputClass =
  "focus-ring mt-1.5 w-full rounded-md border border-asphalt-600 bg-asphalt-900 px-3 py-2.5 text-sm text-chrome-100 placeholder-chrome-500/60 transition focus:border-ignition";

export const SearchFilters = ({
  search,
  category,
  minPrice,
  maxPrice,
  categories,
  onSearchChange,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
  resultCount,
}: SearchFiltersProps) => {
  return (
    <div className="rounded-lg border border-asphalt-700 bg-asphalt-800 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-chrome-100">
          Find a Vehicle
        </h2>
        <button onClick={onReset} className="focus-ring text-xs font-semibold text-ignition hover:text-ignition-600">
          Reset all
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-chrome-500">Search</label>
          <input
            type="search"
            placeholder="Make, model…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-chrome-500">Category</label>
          <select value={category} onChange={(e) => onCategoryChange(e.target.value)} className={inputClass}>
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-chrome-500">Min Price ($)</label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-chrome-500">Max Price ($)</label>
          <input
            type="number"
            min="0"
            placeholder="Any"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <p className="mt-3 font-mono text-xs text-chrome-500">
        Showing {resultCount} vehicle{resultCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
};
