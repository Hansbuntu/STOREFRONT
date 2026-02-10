import { useEffect, useState } from "react";
import { Container } from "../components/layout/Container";
import { SortBar } from "../components/listings/SortBar";
import { ListingRow } from "../components/listings/ListingRow";
import { ListingGridCard } from "../components/listings/ListingGridCard";
import { listingsApi } from "../api/listings";
import { Listing, ViewMode, SortOption } from "../types";

export default function Home() {
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
      .list()
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
  }, []);

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

  const featured = sortedListings.slice(0, 3);
  const newlyListed = sortedListings
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-5">
        <Container>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
            Welcome to STOREFRONT
          </h1>
          <p className="text-sm sm:text-base text-gray-700">
            Anonymous marketplace with platform escrow protection
          </p>
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
        ) : (
          <>
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Featured Listings
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.map((listing) => (
                  <ListingGridCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Newly Listed
                </h2>
              </div>
              <SortBar
                currentSort={sort}
                onSortChange={setSort}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                resultCount={newlyListed.length}
              />
              {viewMode === "list" ? (
                <div className="bg-white border border-gray-200 rounded">
                  {newlyListed.map((listing) => (
                    <ListingRow key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {newlyListed.map((listing) => (
                    <ListingGridCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </Container>
    </div>
  );
}
