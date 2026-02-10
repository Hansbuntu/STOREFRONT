import { useEffect, useState } from "react";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { storage } from "../lib/storage";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/ToastContainer";
import { listingsApi } from "../api/listings";
import { Listing } from "../types";
import { ordersApi } from "../api/orders";
import { Container } from "../components/layout/Container";

export default function Checkout() {
  const { id } = useParams<{ id?: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();
  const demoEnabled = import.meta.env.VITE_DEMO_MODE === "true";
  const [cart, setCart] = useState(storage.getCart());
  const [listing, setListing] = useState<Listing | null>(null);
  const [listingLoading, setListingLoading] = useState(false);
  const [listingError, setListingError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!demoEnabled) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Container className="py-10">
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Checkout coming soon
            </h1>
            <p className="text-sm text-gray-700 mb-6">
              We are not accepting payments yet. Browse listings and save items
              to your cart for later.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Back to Home
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  useEffect(() => {
    const updateCart = () => setCart(storage.getCart());
    window.addEventListener("cart:updated", updateCart as EventListener);
    window.addEventListener("storage", updateCart);
    return () => {
      window.removeEventListener("cart:updated", updateCart as EventListener);
      window.removeEventListener("storage", updateCart);
    };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("storefront_delivery_location");
    if (stored) {
      setDeliveryLocation(stored);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!id) return;
    setListingLoading(true);
    setListingError("");
    listingsApi
      .getById(Number(id))
      .then(({ listing: data }) => {
        if (!isMounted) return;
        setListing(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setListingError("Unable to load listing.");
      })
      .finally(() => {
        if (!isMounted) return;
        setListingLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (id && listingLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-600">Loading checkout...</div>
      </div>
    );
  }

  if (id && (listingError || !listing)) {
    return <Navigate to="/" replace />;
  }

  if (!id && cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <Container className="py-10">
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h1>
            <p className="text-sm text-gray-700 mb-6">
              Add items to your cart before checking out.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Back to Home
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const subtotal = id
    ? listing!.priceGhs
    : cart.reduce((total, item) => total + item.priceGhs * item.qty, 0);
  const shippingTotal = id
    ? listing!.shippingFeeGhs || 0
    : cart.reduce(
        (total, item) => total + (item.shippingFeeGhs || 0) * item.qty,
        0
      );
  const total = subtotal + shippingTotal;

  const handlePlaceOrder = async () => {
    if (placingOrder) return;
    if (!demoEnabled) {
      showToast("Checkout is coming soon.", "info");
      return;
    }
    if (!deliveryLocation.trim()) {
      showToast("Please enter your delivery location.", "error");
      return;
    }
    setPlacingOrder(true);
    try {
      const items =
        id && listing
          ? [{ listingId: listing.id, qty: 1 }]
          : cart.map((item) => ({ listingId: item.listingId, qty: item.qty }));

      const response = await ordersApi.demoCheckout(items);
      storage.clearCart();
      showToast("Order placed (demo)", "success");
      if (response.orders.length === 1) {
        navigate(`/orders/${response.orders[0].id}`);
      } else {
        navigate("/account/orders");
      }
    } catch (err: any) {
      showToast(
        err.response?.data?.error?.message || "Unable to place order",
        "error"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported on this device.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(
          5
        )}, ${position.coords.longitude.toFixed(5)}`;
        const value = `GPS: ${coords}`;
        setDeliveryLocation(value);
        localStorage.setItem("storefront_delivery_location", value);
        setLocating(false);
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied. You can type your address instead."
            : "Unable to get your location. Please type it manually.";
        setLocationError(message);
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Container className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Checkout (Placeholder)
        </h1>
        <div className="bg-white text-gray-900 border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Order Summary
          </h2>
          {id && listing ? (
            <>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={listing.imageUrl}
                    alt={listing.title}
                    className="w-20 h-20 object-cover rounded border border-gray-200"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-gray-700">
                      {listing.location} • {listing.deliveryLabel}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      GHS {listing.priceGhs.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-800">
                  <span className="text-gray-700 font-medium">Subtotal:</span>
                  <span className="font-medium text-gray-800">
                    GHS {listing.priceGhs.toLocaleString()}
                  </span>
                </div>
                {listing.shippingFeeGhs && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">Shipping:</span>
                    <span className="font-medium text-gray-700">
                      GHS {listing.shippingFeeGhs.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold text-gray-900 border-t border-gray-200 pt-2">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">
                    GHS {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4 mb-4">
                {cart.map((item) => (
                  <div
                    key={item.listingId}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded border border-gray-200"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-700">
                        Qty {item.qty}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-semibold text-gray-900">
                        GHS {(item.priceGhs * item.qty).toLocaleString()}
                      </p>
                      {item.shippingFeeGhs ? (
                        <p className="text-xs text-gray-700">
                          + GHS{" "}
                          {(item.shippingFeeGhs * item.qty).toLocaleString()}{" "}
                          shipping
                        </p>
                      ) : (
                        <p className="text-xs text-gray-700">Free shipping</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-800">
                  <span className="text-gray-700 font-medium">Subtotal:</span>
                  <span className="font-medium text-gray-900">
                    GHS {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">Shipping:</span>
                  <span className="font-medium text-gray-900">
                    GHS {shippingTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold text-gray-900 border-t border-gray-200 pt-2">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">
                    GHS {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            Escrow Protection Active
          </h2>
          <p className="text-sm text-blue-800">
            Your payment of <strong>GHS {total.toLocaleString()}</strong> will be
            held securely by STOREFRONT until you confirm delivery. This protects
            both you and the seller.
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Delivery location
          </h2>
          <p className="text-sm text-gray-700 mb-4">
            Share your delivery location. You can use GPS or type it manually.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <button
              onClick={handleUseMyLocation}
              className="w-full sm:w-auto bg-gray-900 text-white px-4 py-2 rounded hover:bg-black disabled:opacity-60"
              disabled={locating}
            >
              {locating ? "Getting location..." : "Use my location"}
            </button>
            <span className="text-xs text-gray-500">
              We only use this for delivery updates.
            </span>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Delivery address or area
            </label>
            <input
              type="text"
              value={deliveryLocation}
              onChange={(event) => {
                const value = event.target.value;
                setDeliveryLocation(value);
                localStorage.setItem("storefront_delivery_location", value);
              }}
              placeholder="e.g., East Legon, Accra or GPS coordinates"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {locationError && (
              <p className="text-xs text-red-600">{locationError}</p>
            )}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Demo mode:</strong> Payments are disabled. Placing an order
            will save a local order draft only.
          </p>
        </div>
        <div className="flex gap-3">
          {id && listing ? (
            <Link
              to={`/listing/${listing.id}`}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded text-center hover:bg-gray-50"
            >
              Back to Listing
            </Link>
          ) : (
            <Link
              to="/cart"
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded text-center hover:bg-gray-50"
            >
              Back to Cart
            </Link>
          )}
          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder}
            className="flex-1 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {placingOrder ? "Placing Order..." : "Place Order (Demo)"}
          </button>
        </div>
      </Container>
    </div>
  );
}
