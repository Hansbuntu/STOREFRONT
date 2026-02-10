import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { ListingGridCard } from "../components/listings/ListingGridCard";
import { listingsApi } from "../api/listings";
import { Listing } from "../types";
import { Container } from "../components/layout/Container";

export default function SellerProfile() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    if (!sellerId) return;
    setLoading(true);
    setError("");
    listingsApi
      .list({ sellerId: Number(sellerId) })
      .then(({ listings: data }) => {
        if (!isMounted) return;
        setListings(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Unable to load seller listings.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [sellerId]);

  if (!sellerId) {
    return <Navigate to="/" replace />;
  }

  const seller = listings[0]?.seller || null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                {seller?.pseudonym || "Seller"}
              </h1>
              {seller?.sellerProfileStatus === "verified" && (
                <span className="inline-block bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded mb-2">
                  ✓ Verified Seller
                </span>
              )}
              <p className="text-sm text-gray-700">
                Active listings from this seller.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded p-8 text-center text-gray-700">
            Loading listings...
          </div>
        ) : error ? (
          <div className="bg-white border border-gray-200 rounded p-8 text-center text-gray-700">
            {error}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded p-8 text-center">
            <p className="text-gray-700">No listings found for this seller.</p>
            <Link to="/" className="text-blue-600 hover:underline text-sm">
              Back to home
            </Link>
          </div>
        ) : (
          <div className="mt-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Active Listings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <ListingGridCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
