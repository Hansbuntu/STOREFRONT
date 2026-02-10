import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { storage } from "../lib/storage";
import { listings } from "../data/mockData";
import { ListingGridCard } from "../components/listings/ListingGridCard";
import { Container } from "../components/layout/Container";
import { useEffect, useState } from "react";

export default function Account() {
  const { user, isAuthenticated } = useAuth();
  const [addressName, setAddressName] = useState("");
  const [addressPhone, setAddressPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressRegion, setAddressRegion] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [expanded, setExpanded] = useState({
    details: true,
    address: true,
    watchlist: true,
    recentlyViewed: true,
  });
  const [prefEmail, setPrefEmail] = useState(true);
  const [prefSms, setPrefSms] = useState(false);
  const [prefPromos, setPrefPromos] = useState(false);
  const [prefSaved, setPrefSaved] = useState("");

  useEffect(() => {
    const savedLocation = localStorage.getItem("storefront_delivery_location");
    const savedNotes = localStorage.getItem("storefront_delivery_notes");
    if (savedLocation && !savedLocation.startsWith("GPS:")) {
      setAddressLine1(savedLocation);
    }
    const savedAddress = localStorage.getItem("storefront_saved_address");
    if (savedAddress) {
      try {
        const parsed = JSON.parse(savedAddress);
        setAddressName(parsed.name || "");
        setAddressPhone(parsed.phone || "");
        setAddressLine1(parsed.line1 || "");
        setAddressLine2(parsed.line2 || "");
        setAddressCity(parsed.city || "");
        setAddressRegion(parsed.region || "");
      } catch {
        // ignore invalid JSON
      }
    }
    if (savedNotes) setDeliveryNotes(savedNotes);
    const prefsRaw = localStorage.getItem("storefront_account_prefs");
    if (prefsRaw) {
      try {
        const parsed = JSON.parse(prefsRaw);
        setPrefEmail(!!parsed.email);
        setPrefSms(!!parsed.sms);
        setPrefPromos(!!parsed.promos);
      } catch {
        // ignore invalid JSON
      }
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 mb-4">Please log in to view your account.</p>
          <Link
            to="/login"
            className="text-blue-600 hover:underline"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const watchlistIds = storage.getWatchlist();
  const recentlyViewedIds = storage.getRecentlyViewed();
  const watchlistListings = listings.filter((l) =>
    watchlistIds.includes(l.id)
  );
  const recentlyViewedListings = listings.filter((l) =>
    recentlyViewedIds.includes(l.id)
  );
  const cartCount = storage
    .getCart()
    .reduce((total, item) => total + item.qty, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Your Account
          </h1>
          <p className="text-sm text-gray-600">
            Manage orders, addresses, and your storefront settings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                to="/account/orders"
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
              >
                <h2 className="text-sm font-semibold text-gray-900 mb-1">
                  Your Orders
                </h2>
                <p className="text-xs text-gray-600">
                  Track, return, or review purchases.
                </p>
              </Link>
              <Link
                to="/cart"
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
              >
                <h2 className="text-sm font-semibold text-gray-900 mb-1">
                  Cart
                </h2>
                <p className="text-xs text-gray-600">
                  {cartCount} item{cartCount === 1 ? "" : "s"} in cart.
                </p>
              </Link>
              <Link
                to="/sell"
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
              >
                <h2 className="text-sm font-semibold text-gray-900 mb-1">
                  Start Selling
                </h2>
                <p className="text-xs text-gray-600">
                  Create or manage listings.
                </p>
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem("storefront_saved_address");
                  localStorage.removeItem("storefront_delivery_notes");
                  localStorage.removeItem("storefront_delivery_location");
                  setAddressName("");
                  setAddressPhone("");
                  setAddressLine1("");
                  setAddressLine2("");
                  setAddressCity("");
                  setAddressRegion("");
                  setDeliveryNotes("");
                  setSavedMessage("Address cleared.");
                  setTimeout(() => setSavedMessage(""), 2000);
                }}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition text-left"
              >
                <h2 className="text-sm font-semibold text-gray-900 mb-1">
                  Clear Address
                </h2>
                <p className="text-xs text-gray-600">
                  Remove saved delivery details.
                </p>
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <button
                onClick={() =>
                  setExpanded((prev) => ({ ...prev, details: !prev.details }))
                }
                className="w-full flex items-center justify-between mb-4"
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  Account Details
                </h2>
                <span className="text-xs text-gray-500">
                  {expanded.details ? "Hide" : "Show"}
                </span>
              </button>
              {expanded.details && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="border border-gray-200 rounded p-4">
                    <p className="text-xs text-gray-500 mb-1">Pseudonym</p>
                    <p className="font-semibold text-gray-900">
                      {user?.pseudonym}
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded p-4">
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="font-semibold text-gray-900">
                      {user?.email || "—"}
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded p-4">
                    <p className="text-xs text-gray-500 mb-1">Role</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {user?.role}
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded p-4">
                    <p className="text-xs text-gray-500 mb-1">KYC Status</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {user?.kycStatus || "unverified"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <button
                onClick={() =>
                  setExpanded((prev) => ({ ...prev, address: !prev.address }))
                }
                className="w-full flex items-center justify-between mb-4"
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  Saved Address
                </h2>
                <span className="text-xs text-gray-500">
                  {expanded.address ? "Hide" : "Show"}
                </span>
              </button>
              {expanded.address && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={addressName}
                    onChange={(event) => setAddressName(event.target.value)}
                    placeholder="Recipient name"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone number
                  </label>
                  <input
                    type="text"
                    value={addressPhone}
                    onChange={(event) => setAddressPhone(event.target.value)}
                    placeholder="e.g., 0241234567"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address line 1
                  </label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(event) => setAddressLine1(event.target.value)}
                    placeholder="Street, building, house number"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address line 2 (optional)
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(event) => setAddressLine2(event.target.value)}
                    placeholder="Apartment, floor, landmark"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={addressCity}
                    onChange={(event) => setAddressCity(event.target.value)}
                    placeholder="City / Town"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region
                  </label>
                  <input
                    type="text"
                    value={addressRegion}
                    onChange={(event) => setAddressRegion(event.target.value)}
                    placeholder="Region / State"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery notes
                  </label>
                  <textarea
                    rows={3}
                    value={deliveryNotes}
                    onChange={(event) => setDeliveryNotes(event.target.value)}
                    placeholder="Landmark, gate instructions, preferred time..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center gap-3">
                  <button
                    onClick={() => {
                      localStorage.setItem(
                        "storefront_saved_address",
                        JSON.stringify({
                          name: addressName,
                          phone: addressPhone,
                          line1: addressLine1,
                          line2: addressLine2,
                          city: addressCity,
                          region: addressRegion,
                        })
                      );
                      localStorage.setItem(
                        "storefront_delivery_notes",
                        deliveryNotes
                      );
                      if (addressLine1) {
                        localStorage.setItem(
                          "storefront_delivery_location",
                          addressLine1
                        );
                      }
                      setSavedMessage("Saved.");
                      setTimeout(() => setSavedMessage(""), 2000);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    Save address
                  </button>
                  {savedMessage && (
                    <span className="text-xs text-green-600">{savedMessage}</span>
                  )}
                </div>
              </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Communication Preferences
              </h2>
              <div className="space-y-3 text-sm">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Email updates</span>
                  <input
                    type="checkbox"
                    checked={prefEmail}
                    onChange={(event) => setPrefEmail(event.target.checked)}
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">SMS updates</span>
                  <input
                    type="checkbox"
                    checked={prefSms}
                    onChange={(event) => setPrefSms(event.target.checked)}
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Promotions</span>
                  <input
                    type="checkbox"
                    checked={prefPromos}
                    onChange={(event) => setPrefPromos(event.target.checked)}
                  />
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      localStorage.setItem(
                        "storefront_account_prefs",
                        JSON.stringify({
                          email: prefEmail,
                          sms: prefSms,
                          promos: prefPromos,
                        })
                      );
                      setPrefSaved("Preferences saved.");
                      setTimeout(() => setPrefSaved(""), 2000);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    Save preferences
                  </button>
                  {prefSaved && (
                    <span className="text-xs text-green-600">{prefSaved}</span>
                  )}
                </div>
              </div>
            </div>

            {watchlistListings.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <button
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      watchlist: !prev.watchlist,
                    }))
                  }
                  className="w-full flex items-center justify-between mb-4"
                >
                  <h2 className="text-lg font-semibold text-gray-900">
                    Watchlist ({watchlistListings.length})
                  </h2>
                  <span className="text-xs text-gray-500">
                    {expanded.watchlist ? "Hide" : "Show"}
                  </span>
                </button>
                {expanded.watchlist && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {watchlistListings.map((listing) => (
                      <ListingGridCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                )}
              </div>
            )}
            {recentlyViewedListings.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <button
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      recentlyViewed: !prev.recentlyViewed,
                    }))
                  }
                  className="w-full flex items-center justify-between mb-4"
                >
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recently Viewed ({recentlyViewedListings.length})
                  </h2>
                  <span className="text-xs text-gray-500">
                    {expanded.recentlyViewed ? "Hide" : "Show"}
                  </span>
                </button>
                {expanded.recentlyViewed && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentlyViewedListings.map((listing) => (
                      <ListingGridCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Links
              </h2>
              <nav className="space-y-2">
                <Link
                  to="/account/orders"
                  className="block text-blue-600 hover:underline text-sm"
                >
                  My Orders
                </Link>
                <Link
                  to="/cart"
                  className="block text-blue-600 hover:underline text-sm"
                >
                  Cart ({cartCount})
                </Link>
                <Link
                  to="/sell"
                  className="block text-blue-600 hover:underline text-sm"
                >
                  Sell an Item
                </Link>
                <Link
                  to="/seller/profile"
                  className="block text-blue-600 hover:underline text-sm"
                >
                  Seller Profile
                </Link>
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="block text-blue-600 hover:underline text-sm"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/disputes"
                  className="block text-blue-600 hover:underline text-sm"
                >
                  My Disputes
                </Link>
              </nav>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Account Snapshot
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Watchlist</span>
                  <span className="font-semibold text-gray-900">
                    {watchlistListings.length}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Cart items</span>
                  <span className="font-semibold text-gray-900">
                    {cartCount}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Recently viewed</span>
                  <span className="font-semibold text-gray-900">
                    {recentlyViewedListings.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
