import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listingsApi } from "../api/listings";
import { sellerApi } from "../api/seller";
import { Listing } from "../types";
import { Container } from "../components/layout/Container";
import { ToastContainer } from "../components/ui/ToastContainer";
import { useToast } from "../hooks/useToast";

type EditableListing = Listing & {
  draftTitle: string;
  draftPrice: string;
  draftQty: string;
  error?: string | null;
};

export default function SellerPortal() {
  const { user, isAuthenticated } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState<EditableListing[]>([]);
  const [pendingImages, setPendingImages] = useState<Record<number, File[]>>(
    {}
  );
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [sellerStatus, setSellerStatus] = useState<{
    role: string;
    sellerProfileStatus: string;
    adminNotes?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const listingRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const titleInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    Promise.all([listingsApi.list({ sellerId: user.id }), sellerApi.status()])
      .then(([listingResponse, statusResponse]) => {
        if (!mounted) return;
        setSellerStatus(statusResponse);
        setListings(
          listingResponse.listings.map((listing) => ({
            ...listing,
            draftTitle: listing.title,
            draftPrice: String(listing.priceGhs),
            draftQty: String(listing.quantity),
            error: null,
          }))
        );
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

  const focusListingId = useMemo(() => {
    const param = searchParams.get("listingId");
    return param ? Number(param) : null;
  }, [searchParams]);

  useEffect(() => {
    if (!focusListingId) return;
    const node = listingRefs.current[focusListingId];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusListingId, listings]);

  const handleDraftChange = (
    id: number,
    field:
      | "draftTitle"
      | "draftPrice"
      | "draftQty",
    value: string
  ) => {
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === id ? { ...listing, [field]: value } : listing
      )
    );
  };

  const canEdit = sellerStatus?.sellerProfileStatus === "verified";

  const handleSave = async (listing: EditableListing) => {
    if (savingId) return;
    if (!canEdit) {
      showToast("Seller approval required before editing listings.", "error");
      return;
    }
    setSavingId(listing.id);
    try {
      const parsedPrice = Number(listing.draftPrice);
      const parsedQty = Number(listing.draftQty);
      const priceGhs = Number.isFinite(parsedPrice)
        ? Math.max(0, Math.round(parsedPrice))
        : listing.priceGhs;
      const quantity = Number.isFinite(parsedQty)
        ? Math.max(1, Math.round(parsedQty))
        : listing.quantity;
      const response = await listingsApi.update(listing.id, {
        title: listing.draftTitle.trim() || listing.title,
        priceGhs,
        quantity,
      });
      setListings((prev) =>
        prev.map((item) =>
          item.id === listing.id
            ? {
                ...response.listing,
                draftTitle: response.listing.title,
                draftPrice: String(response.listing.priceGhs),
                draftQty: String(response.listing.quantity),
                error: null,
              }
            : item
        )
      );
      showToast("Inventory updated.", "success");
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message || "Unable to update listing.";
      setListings((prev) =>
        prev.map((item) =>
          item.id === listing.id ? { ...item, error: message } : item
        )
      );
      showToast(message, "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleImageSelect = (listingId: number, files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setPendingImages((prev) => ({
      ...prev,
      [listingId]: fileArray,
    }));
  };

  const handleUploadImages = async (listing: EditableListing) => {
    const files = pendingImages[listing.id];
    if (!files || files.length === 0) {
      showToast("Select images to upload.", "error");
      return;
    }
    if (!canEdit) {
      showToast("Seller approval required before editing listings.", "error");
      return;
    }
    setUploadingId(listing.id);
    try {
      const response = await listingsApi.uploadImages(listing.id, files);
      setListings((prev) =>
        prev.map((item) =>
          item.id === listing.id
            ? {
                ...item,
                images: [...(item.images || []), ...response.images],
              }
            : item
        )
      );
      setPendingImages((prev) => ({ ...prev, [listing.id]: [] }));
      showToast("Images uploaded.", "success");
    } catch (err: any) {
      showToast(
        err?.response?.data?.error?.message || "Unable to upload images.",
        "error"
      );
    } finally {
      setUploadingId(null);
    }
  };

  const handleReplaceImages = async (listing: EditableListing) => {
    const files = pendingImages[listing.id];
    if (!files || files.length === 0) {
      showToast("Select images to replace.", "error");
      return;
    }
    if (!canEdit) {
      showToast("Seller approval required before editing listings.", "error");
      return;
    }
    setUploadingId(listing.id);
    try {
      await listingsApi.clearImages(listing.id);
      const response = await listingsApi.uploadImages(listing.id, files);
      setListings((prev) =>
        prev.map((item) =>
          item.id === listing.id
            ? {
                ...item,
                images: response.images,
                imageUrl: response.images[0]?.url || item.imageUrl,
              }
            : item
        )
      );
      setPendingImages((prev) => ({ ...prev, [listing.id]: [] }));
      showToast("Images replaced.", "success");
    } catch (err: any) {
      showToast(
        err?.response?.data?.error?.message || "Unable to replace images.",
        "error"
      );
    } finally {
      setUploadingId(null);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Container className="py-6 space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Seller Portal
          </h1>
          <p className="text-sm text-gray-700">
            Manage your inventory quickly from one place.
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

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Inventory
            </h2>
            <Link
              to="/sell"
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Create new listing
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
            <div className="space-y-4">
              {listings.map((listing) => {
                const primaryImage =
                  listing.images && listing.images.length > 0
                    ? listing.images[0].url
                    : listing.imageUrl;
                const fallbackImage =
                  "https://via.placeholder.com/200x200?text=Listing";
                return (
                <div
                  key={listing.id}
                  ref={(node) => {
                    listingRefs.current[listing.id] = node;
                  }}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex flex-col lg:flex-row gap-4">
                  <img
                    src={primaryImage || fallbackImage}
                    alt={listing.title}
                    className="w-24 h-24 rounded object-cover border border-gray-200"
                    onError={(event) => {
                      const target = event.currentTarget;
                      if (target.src !== fallbackImage) {
                        target.src = fallbackImage;
                      }
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {listing.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          listing.status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {listing.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Created {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600">
                          Title
                        </label>
                        <input
                          type="text"
                          value={listing.draftTitle}
                          onChange={(event) =>
                            handleDraftChange(
                              listing.id,
                              "draftTitle",
                              event.target.value
                            )
                          }
                          ref={(node) => {
                            titleInputRefs.current[listing.id] = node;
                          }}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">
                          Price (GHS)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={listing.draftPrice}
                          onChange={(event) =>
                            handleDraftChange(
                              listing.id,
                              "draftPrice",
                              event.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={listing.draftQty}
                          onChange={(event) =>
                            handleDraftChange(
                              listing.id,
                              "draftQty",
                              event.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-900"
                        />
                      </div>
                    </div>
                    {listing.error && (
                      <p className="text-xs text-red-600 mt-2">
                        {listing.error}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      to={`/listing/${listing.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View listing
                    </Link>
                    <button
                      onClick={() => {
                        const node = titleInputRefs.current[listing.id];
                        if (node) {
                          node.focus();
                          node.select();
                        }
                      }}
                      className="text-sm text-blue-600 hover:underline text-left"
                    >
                      Edit listing
                    </button>
                    <button
                      onClick={() => handleSave(listing)}
                      disabled={savingId === listing.id || !canEdit}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-60"
                    >
                      {savingId === listing.id ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                  </div>
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) =>
                        handleImageSelect(listing.id, event.target.files)
                      }
                      className="text-xs text-gray-600"
                    />
                    <button
                      onClick={() => handleUploadImages(listing)}
                      disabled={uploadingId === listing.id || !canEdit}
                      className="text-xs border border-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-50 disabled:opacity-60"
                    >
                      {uploadingId === listing.id ? "Uploading..." : "Add images"}
                    </button>
                    <button
                      onClick={() => handleReplaceImages(listing)}
                      disabled={uploadingId === listing.id || !canEdit}
                      className="text-xs border border-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-50 disabled:opacity-60"
                    >
                      Replace images
                    </button>
                  </div>
                  {listing.images && listing.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {listing.images.map((image) => (
                        <div
                          key={image.id}
                          className="w-16 h-16 border border-gray-200 rounded overflow-hidden"
                        >
                          <img
                            src={image.url}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                            onError={(event) => {
                              event.currentTarget.src =
                                "https://via.placeholder.com/200x200?text=Listing";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
