import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container } from "../components/layout/Container";
import { SortBar } from "../components/listings/SortBar";
import { ListingRow } from "../components/listings/ListingRow";
import { ListingGridCard } from "../components/listings/ListingGridCard";
import { listingsApi } from "../api/listings";
import { Listing, ViewMode, SortOption } from "../types";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sort, setSort] = useState<SortOption>("best_match");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");
    listingsApi
      .list({ q: query })
      .then(({ listings: data }) => {
        if (!isMounted) return;
        setListings(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Unable to load listings.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [query]);

  const sortedListings = [...listings].sort((a, b) => {
    switch (sort) {
      case "price_low":
        return a.priceGhs - b.priceGhs;
      case "price_high":
        return b.priceGhs - a.priceGhs;
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-4">
        <Container>
          <h1 className="text-2xl font-semibold text-gray-900">
            Search results for "{query}"
          </h1>
        </Container>
      </div>
      <Container className="py-4">
        {loading ? (
          <div className="bg-white border border-gray-200 rounded p-8 text-center text-gray-700">
            Loading listings...
          </div>
        ) : error ? (
          <div className="bg-white border border-gray-200 rounded p-8 text-center text-gray-700">
            {error}
          </div>
        ) : sortedListings.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded p-8 text-center">
            <p className="text-gray-700">No listings found for "{query}".</p>
          </div>
        ) : (
          <>
            <SortBar
              currentSort={sort}
              onSortChange={setSort}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              resultCount={sortedListings.length}
            />
            {viewMode === "list" ? (
              <div className="bg-white border border-gray-200 rounded mt-4">
                {sortedListings.map((listing) => (
                  <ListingRow key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {sortedListings.map((listing) => (
                  <ListingGridCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
