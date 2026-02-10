import { SortOption } from "../../types";

interface SortBarProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  resultCount?: number;
}

export function SortBar({
  currentSort,
  onSortChange,
  viewMode,
  onViewModeChange,
  resultCount,
}: SortBarProps) {
  return (
    <div className="flex items-center justify-between py-2 px-4 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center gap-4">
        {resultCount !== undefined && (
          <span className="text-sm text-gray-700 font-medium">
            {resultCount} {resultCount === 1 ? "result" : "results"}
          </span>
        )}
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
        >
          <option value="best_match">Best Match</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="newest">Newly Listed</option>
          <option value="top_rated">Top Rated Sellers</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onViewModeChange("list")}
          className={`p-1.5 rounded ${
            viewMode === "list"
              ? "bg-blue-100 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="List view"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <button
          onClick={() => onViewModeChange("grid")}
          className={`p-1.5 rounded ${
            viewMode === "grid"
              ? "bg-blue-100 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Grid view"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

