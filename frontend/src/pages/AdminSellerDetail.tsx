import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  approveAdminSeller,
  fetchAdminSeller,
  rejectAdminSeller,
  fetchAdminListings,
  pauseAdminListing,
  enableAdminListing,
  AdminSellerDetail,
  AdminListing,
} from "../api/admin";
import { Container } from "../components/layout/Container";
import { ToastContainer } from "../components/ui/ToastContainer";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../context/AuthContext";

function AdminSellerDetailPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams();
  const { toasts, showToast, removeToast } = useToast();
  const [seller, setSeller] = useState<AdminSellerDetail | null>(null);
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const guardShownRef = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (user && user.role !== "admin" && !guardShownRef.current) {
      guardShownRef.current = true;
      showToast("Access denied. Admins only.", "error");
      navigate("/account", { replace: true });
    }
  }, [loading, navigate, showToast, user]);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    setIsLoading(true);
    setError(null);
    Promise.all([
      fetchAdminSeller(Number(userId)),
      fetchAdminListings(Number(userId)),
    ])
      .then(([sellerData, listingData]) => {
        if (!mounted) return;
        setSeller(sellerData);
        setListings(listingData);
      })
      .catch((err) => {
        if (!mounted) return;
        const message =
          err?.response?.data?.error?.message ||
          err?.message ||
          "Unable to load seller.";
        setError(message);
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [userId]);

  const canApprove =
    seller?.sellerProfile.status === "pending" &&
    seller?.sellerProfile.policiesAccepted;

  const handleApprove = async () => {
    if (!seller) return;
    if (
      !window.confirm(
        `Approve ${seller.sellerProfile.storeName}? This will allow them to create listings.`
      )
    ) {
      return;
    }
    setSubmitting(true);
    try {
      await approveAdminSeller(seller.userId);
      showToast("Seller approved successfully.", "success");
      navigate("/admin?status=pending", { replace: true });
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Unable to approve seller.";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!seller) return;
    if (!rejectReason.trim()) {
      showToast("Please add a rejection reason.", "error");
      return;
    }
    if (
      !window.confirm(
        `Reject ${seller.sellerProfile.storeName}? The seller will be blocked from listing.`
      )
    ) {
      return;
    }
    setSubmitting(true);
    try {
      await rejectAdminSeller(seller.userId, rejectReason.trim());
      showToast("Seller rejected.", "success");
      navigate("/admin?status=pending", { replace: true });
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Unable to reject seller.";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleListing = async (listing: AdminListing) => {
    if (
      !window.confirm(
        listing.status === "active"
          ? `Pause listing "${listing.title}"? This will hide it from buyers.`
          : `Enable listing "${listing.title}"? This will make it visible.`
      )
    ) {
      return;
    }
    try {
      if (listing.status === "active") {
        await pauseAdminListing(listing.id);
        showToast("Listing paused.", "success");
      } else {
        await enableAdminListing(listing.id);
        showToast("Listing enabled.", "success");
      }
      const refreshed = await fetchAdminListings(Number(userId));
      setListings(refreshed);
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Unable to update listing.";
      showToast(message, "error");
    }
  };

  return (
    <Container>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">
              <Link to="/admin" className="hover:text-blue-600">
                Admin
              </Link>{" "}
              / Seller detail
            </p>
            <h1 className="text-2xl font-semibold text-gray-900">
              Seller review
            </h1>
          </div>
          <Link
            to="/admin"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Back to list
          </Link>
        </div>

        {isLoading ? (
          <div className="text-sm text-gray-600">Loading...</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : !seller ? (
          <div className="text-sm text-gray-600">Seller not found.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                <h2 className="text-sm font-semibold text-gray-900">
                  Store profile
                </h2>
                <div>
                  <p className="text-xs text-gray-500">Store name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {seller.sellerProfile.storeName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm text-gray-800 whitespace-pre-line">
                    {seller.sellerProfile.storeDescription}
                  </p>
                </div>
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm text-gray-900">
                      {seller.sellerProfile.storeLocation}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Policies accepted</p>
                    <p className="text-sm text-gray-900">
                      {seller.sellerProfile.policiesAccepted ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                <h2 className="text-sm font-semibold text-gray-900">
                  Contact (private)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Contact email</p>
                    <p className="text-sm text-gray-900">
                      {seller.sellerProfile.contactEmail ?? "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Contact phone</p>
                    <p className="text-sm text-gray-900">
                      {seller.sellerProfile.contactPhone ?? "Not provided"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                <h2 className="text-sm font-semibold text-gray-900">
                  Admin notes
                </h2>
                <p className="text-sm text-gray-700">
                  {seller.sellerProfile.adminNotes ??
                    "No admin notes on this profile."}
                </p>
              </section>

              <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                <h2 className="text-sm font-semibold text-gray-900">
                  Listings moderation
                </h2>
                {listings.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    This seller has no listings yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {listings.map((listing) => (
                      <div
                        key={listing.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-gray-200 rounded-lg p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {listing.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            GHS {listing.priceGhs.toLocaleString()} ·{" "}
                            {new Date(listing.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              listing.status === "active"
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {listing.status}
                          </span>
                          <button
                            onClick={() => handleToggleListing(listing)}
                            className="text-xs border border-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-50"
                          >
                            {listing.status === "active"
                              ? "Pause"
                              : "Enable"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-4">
              <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                <h2 className="text-sm font-semibold text-gray-900">
                  Seller checks
                </h2>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>
                    Email verified:{" "}
                    <span
                      className={
                        seller.emailVerified ? "text-green-600" : "text-red-600"
                      }
                    >
                      {seller.emailVerified ? "Yes" : "No"}
                    </span>
                  </p>
                  <p>
                    Phone verified:{" "}
                    <span
                      className={
                        seller.phoneVerified ? "text-green-600" : "text-red-600"
                      }
                    >
                      {seller.phoneVerified ? "Yes" : "No"}
                    </span>
                  </p>
                  <p>
                    Status:{" "}
                    <span className="font-medium text-gray-900">
                      {seller.sellerProfile.status}
                    </span>
                  </p>
                </div>
              </section>

              <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                <h2 className="text-sm font-semibold text-gray-900">Actions</h2>
                <button
                  onClick={handleApprove}
                  disabled={!canApprove || submitting}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium ${
                    canApprove
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Approve seller
                </button>
                <div className="space-y-2">
                  <textarea
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                    placeholder="Rejection reason..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleReject}
                    disabled={submitting}
                    className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                  >
                    Reject seller
                  </button>
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </Container>
  );
}

export default AdminSellerDetailPage;
