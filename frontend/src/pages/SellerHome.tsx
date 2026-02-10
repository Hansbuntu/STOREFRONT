import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container } from "../components/layout/Container";
import { useAuth } from "../context/AuthContext";
import { listingsApi } from "../api/listings";
import { Listing } from "../types";
import { ToastContainer } from "../components/ui/ToastContainer";
import { useToast } from "../hooks/useToast";
import { sellerApi } from "../api/seller";

export default function SellerHome() {
  const { user, isAuthenticated } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [sellerStatus, setSellerStatus] = useState<{
    role: string;
    sellerProfileStatus: string;
    adminNotes?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    Promise.all([listingsApi.list({ sellerId: user.id }), sellerApi.status()])
      .then(([listingResponse, statusResponse]) => {
        if (!mounted) return;
        setListings(listingResponse.listings);
        setSellerStatus(statusResponse);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(
          err?.response?.data?.error?.message || "Unable to load listings."
        );
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Container className="py-8 space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Seller Center
          </h1>
          <p className="text-sm text-gray-700">
            Manage your seller profile, inventory, and new listings from one
            place.
          </p>
        </div>

        {sellerStatus && sellerStatus.sellerProfileStatus !== "verified" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            Your seller profile is{" "}
            <strong>{sellerStatus.sellerProfileStatus}</strong>. Listing edits
            are disabled until approval.
            {sellerStatus.adminNotes && (
              <div className="text-xs text-yellow-700 mt-2">
                Admin notes: {sellerStatus.adminNotes}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              Seller Profile
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              Update your store details and policies.
            </p>
            <Link
              to="/seller/profile"
              className="text-sm text-blue-600 hover:underline"
            >
              Manage profile →
            </Link>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              Inventory
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              Update prices and quantities for existing listings.
            </p>
            <Link
              to="/seller/portal"
              className="text-sm text-blue-600 hover:underline"
            >
              Manage inventory →
            </Link>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              Create Listing
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              Add a new product to the marketplace.
            </p>
            <Link
              to="/sell"
              className="text-sm text-blue-600 hover:underline"
            >
              Create listing →
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Listings
            </h2>
            <Link
              to="/sell"
              className="text-sm text-blue-600 hover:underline"
            >
              Create new listing →
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-gray-600">Loading listings...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : listings.length === 0 ? (
            <p className="text-sm text-gray-600">
              No listings yet. Create your first listing to start selling.
            </p>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => {
                const primaryImage =
                  listing.images && listing.images.length > 0
                    ? listing.images[0].url
                    : listing.imageUrl;
                return (
                  <div
                    key={listing.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-gray-200 rounded-lg p-3"
                  >
                    <img
                      src={primaryImage}
                      alt={listing.title}
                      className="w-16 h-16 rounded object-cover border border-gray-200"
                      onError={(event) => {
                        event.currentTarget.src =
                          "https://via.placeholder.com/200x200?text=Listing";
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {listing.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        GHS {listing.priceGhs.toLocaleString()} · Qty{" "}
                        {listing.quantity}
                      </p>
                    </div>
                    <Link
                      to={`/seller/portal?listingId=${listing.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
