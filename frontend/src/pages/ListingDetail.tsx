import { useEffect, useState } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { storage } from "../lib/storage";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/ToastContainer";
import { listingsApi } from "../api/listings";
import { Listing } from "../types";
import { Container } from "../components/layout/Container";

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();
  const demoEnabled = import.meta.env.VITE_DEMO_MODE === "true";
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;
    if (!id) return;
    setLoading(true);
    setLoadError("");
    listingsApi
      .getById(Number(id))
      .then(({ listing: fetchedListing }) => {
        if (!isMounted) return;
        setListing(fetchedListing);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadError("Unable to load listing.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!listing) return;
    storage.addToRecentlyViewed(listing.id);
    setIsInWatchlist(storage.isInWatchlist(listing.id));
    setIsInCart(
      storage.getCart().some((item) => item.listingId === listing.id)
    );
  }, [listing]);

  useEffect(() => {
    if (showMessageModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMessageModal]);

  useEffect(() => {
    const updateCart = () => {
      if (listing) {
        setIsInCart(
          storage.getCart().some((item) => item.listingId === listing.id)
        );
      }
    };
    window.addEventListener("cart:updated", updateCart as EventListener);
    window.addEventListener("storage", updateCart);
    return () => {
      window.removeEventListener("cart:updated", updateCart as EventListener);
      window.removeEventListener("storage", updateCart);
    };
  }, [listing]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-600">Loading listing...</div>
      </div>
    );
  }

  if (!listing || loadError) {
    return <Navigate to="/" replace />;
  }

  const seller = listing.seller;
  const primaryImage =
    listing.images && listing.images.length > 0
      ? listing.images[0].url
      : listing.imageUrl;
  const conditionLabels: Record<string, string> = {
    new: "New",
    like_new: "Like New",
    good: "Good",
    fair: "Fair",
    poor: "Poor",
  };

  const handleBuyClick = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { returnTo: `/listing/${listing.id}` } });
      return;
    }
    if (!demoEnabled) {
      showToast("Checkout is coming soon.", "info");
      return;
    }
    navigate(`/checkout/${listing.id}`);
  };

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      storage.removeFromWatchlist(listing.id);
      setIsInWatchlist(false);
      showToast("Removed from watchlist", "info");
    } else {
      storage.addToWatchlist(listing.id);
      setIsInWatchlist(true);
      showToast("Added to watchlist", "success");
    }
  };

  const handleAddToCart = () => {
    const sellerName = seller?.pseudonym || "Seller";
    storage.addToCart({
      listingId: listing.id,
      qty: 1,
      priceGhs: listing.priceGhs,
      shippingFeeGhs: listing.shippingFeeGhs || 0,
      title: listing.title,
      imageUrl: listing.imageUrl,
      sellerId: listing.sellerId,
      sellerName,
    });
    showToast("Added to cart", "success");
  };

  const handleMessageSend = () => {
    if (!messageText.trim()) {
      showToast("Please enter a message", "error");
      return;
    }
    // Store message draft locally (optional)
    const conversations = JSON.parse(
      localStorage.getItem("storefront_conversations") || "[]"
    );
    conversations.push({
      listingId: listing.id,
      sellerId: listing.sellerId,
      message: messageText,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(
      "storefront_conversations",
      JSON.stringify(conversations)
    );
    setShowMessageModal(false);
    setMessageText("");
    showToast("Message sent (placeholder)", "success");
  };


  const breadcrumbItems = [
    { label: "Home", to: "/" },
    { label: listing.title },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Container className="py-6">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="aspect-square bg-gray-200 rounded border border-gray-300 overflow-hidden mb-4">
                <img
                  src={primaryImage}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {listing.images && listing.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {listing.images.slice(0, 4).map((image) => (
                    <div
                      key={image.id}
                      className="aspect-square border border-gray-200 rounded overflow-hidden bg-gray-100"
                    >
                      <img
                        src={image.url}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                {listing.title}
              </h1>
              <div className="text-3xl font-bold text-gray-900 mb-4">
                GHS {listing.priceGhs.toLocaleString()}
              </div>
              <div className="space-y-2 mb-6 text-sm text-gray-700">
                <div>
                  <span className="font-medium">Condition:</span>{" "}
                  {conditionLabels[listing.condition]}
                </div>
                {listing.conditionDetails && (
                  <div>
                    <span className="font-medium">Condition details:</span>{" "}
                    {listing.conditionDetails}
                  </div>
                )}
                {listing.brand && (
                  <div>
                    <span className="font-medium">Brand:</span> {listing.brand}
                  </div>
                )}
                {listing.model && (
                  <div>
                    <span className="font-medium">Model:</span> {listing.model}
                  </div>
                )}
                {listing.sku && (
                  <div>
                    <span className="font-medium">SKU:</span> {listing.sku}
                  </div>
                )}
                <div>
                  <span className="font-medium">Delivery:</span>{" "}
                  {listing.deliveryLabel}
                </div>
                <div>
                  <span className="font-medium">Location:</span>{" "}
                  {listing.location}
                </div>
                <div>
                  <span className="font-medium">Quantity available:</span>{" "}
                  {listing.quantity}
                </div>
                {listing.warranty && (
                  <div>
                    <span className="font-medium">Warranty:</span>{" "}
                    {listing.warranty}
                  </div>
                )}
              </div>
              {listing.escrowProtected && (
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                  <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                    <span>✓</span>
                    <span>Escrow Protected</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Your payment is held securely until you confirm delivery
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <button
                  onClick={handleBuyClick}
                  className={`flex-1 py-3 rounded font-medium ${
                    demoEnabled
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  {demoEnabled ? "Buy with Escrow" : "Checkout coming soon"}
                </button>
                {isInCart ? (
                  <button
                    onClick={() => navigate("/cart")}
                    className="flex-1 border border-blue-600 text-blue-700 py-3 rounded font-medium hover:bg-blue-50"
                  >
                    Go to Cart
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded font-medium hover:bg-gray-50"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleWatchlistToggle}
                  className={`flex-1 border ${
                    isInWatchlist
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-700"
                  } py-2 rounded text-sm hover:bg-gray-50`}
                >
                  {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                </button>
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded text-sm hover:bg-gray-50"
                >
                  Message Seller
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-700 whitespace-pre-line">
                {listing.description || "No description provided."}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Escrow & Buyer Protection
              </h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">1.</span>
                  <span>You pay, funds are held securely by STOREFRONT</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">2.</span>
                  <span>Seller ships/delivers your item</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">3.</span>
                  <span>You confirm delivery, funds release to seller</span>
                </div>
              </div>
            </div>
          </div>
          {seller && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 h-fit">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Seller Information
              </h2>
              <div className="space-y-3">
                <div>
                  <Link
                    to={`/seller/${seller.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {seller.pseudonym}
                  </Link>
                  {seller.sellerProfileStatus === "verified" && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Verified Seller
                    </span>
                  )}
                </div>
                <Link
                  to={`/seller/${seller.id}`}
                  className="block text-center text-sm text-blue-600 hover:underline mt-4"
                >
                  View seller profile →
                </Link>
              </div>
            </div>
          )}
        </div>
      </Container>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-[95vw] sm:w-full sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Message Seller</h3>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMessageText("");
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMessageSend}
                className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
