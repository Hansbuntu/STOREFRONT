import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { storage } from "../../lib/storage";
import { Container } from "./Container";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState(storage.getCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const demoEnabled = import.meta.env.VITE_DEMO_MODE === "true";
  const cartRef = useRef<HTMLDivElement | null>(null);
  const mobileCartRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateCartCount = () => {
      const currentCart = storage.getCart();
      const count = currentCart.reduce((total, item) => total + item.qty, 0);
      setCartCount(count);
      setCartItems(currentCart);
    };

    updateCartCount();

    const handleStorage = () => updateCartCount();
    const handleCartUpdated = () => updateCartCount();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("cart:updated", handleCartUpdated as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cart:updated", handleCartUpdated as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!mobileMenuRef.current) return;
      if (!mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const desktopContains = cartRef.current?.contains(target);
      const mobileContains = mobileCartRef.current?.contains(target);
      if (!desktopContains && !mobileContains) {
        setIsCartOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCartOpen(false);
      }
    };

    if (isCartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isCartOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <Container>
        <div className="flex items-center gap-3 py-3">
          <Link
            to="/"
            className="text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-700"
          >
            STOREFRONT
          </Link>
          {isAuthenticated ? (
            <>
              <form
                onSubmit={handleSearch}
                className="hidden sm:flex flex-1 max-w-2xl"
              >
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for anything..."
                    className="flex-1 border border-gray-300 rounded-l px-4 py-2 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-5 py-2 rounded-r hover:bg-blue-700"
                  >
                    Search
                  </button>
                </div>
              </form>
              <nav className="hidden sm:flex items-center gap-4 text-sm">
                <Link
                  to="/sell"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Sell
                </Link>
                <div ref={cartRef} className="relative">
                  <Link
                    to="/cart"
                    className="relative flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium"
                    onClick={(event) => {
                      event.preventDefault();
                      setIsCartOpen((prev) => !prev);
                    }}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                    </svg>
                    <span>Cart</span>
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-3 bg-blue-600 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  {isCartOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white text-gray-900 border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">
                          Your Cart
                        </h4>
                        <button
                          onClick={() => setIsCartOpen(false)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Close
                        </button>
                      </div>
                      {cartItems.length === 0 ? (
                        <p className="text-sm text-gray-700">
                          Your cart is empty.
                        </p>
                      ) : (
                        <>
                          <div className="space-y-3 max-h-64 overflow-auto">
                            {cartItems.slice(0, 5).map((item) => (
                              <div
                                key={item.listingId}
                                className="flex items-center gap-3"
                              >
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-12 h-12 rounded object-cover border border-gray-200"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                    {item.title}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Qty {item.qty} · GHS{" "}
                                    {(item.priceGhs * item.qty).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-gray-200 mt-3 pt-3 text-sm text-gray-800 flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-semibold">
                              GHS{" "}
                              {cartItems
                                .reduce(
                                  (total, item) =>
                                    total + item.priceGhs * item.qty,
                                  0
                                )
                                .toLocaleString()}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => {
                                setIsCartOpen(false);
                                navigate("/cart");
                              }}
                              className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded hover:bg-gray-50"
                            >
                              View Cart
                            </button>
                            <button
                              onClick={() => {
                                setIsCartOpen(false);
                                if (!demoEnabled) {
                                  navigate("/cart");
                                  return;
                                }
                                navigate("/checkout");
                              }}
                              className={`flex-1 text-sm py-2 rounded ${
                                demoEnabled
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {demoEnabled ? "Checkout" : "Coming soon"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <Link
                  to="/account"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  My Account
                </Link>
                <span className="text-gray-500">|</span>
                <span className="text-gray-600">{user?.pseudonym}</span>
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-blue-600"
                >
                  Logout
                </button>
                <Link to="/help" className="text-gray-700 hover:text-blue-600">
                  Help
                </Link>
              </nav>
              <div className="ml-auto flex items-center gap-2 sm:hidden">
                <button
                  onClick={() => navigate("/search")}
                  className="p-2 text-gray-700 hover:text-blue-600"
                  aria-label="Search"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsCartOpen((prev) => !prev)}
                  className="relative p-2 text-gray-700 hover:text-blue-600"
                  aria-label="Cart"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5">
                      {cartCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  className="p-2 text-gray-700 hover:text-blue-600"
                  aria-label="Menu"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <nav className="ml-auto flex items-center gap-3 text-sm">
              <Link to="/login" className="text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700"
              >
                Register
              </Link>
            </nav>
          )}
        </div>
        {isAuthenticated && mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="sm:hidden border-t border-gray-200 py-3 space-y-2"
          >
            <Link
              to="/sell"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-700 hover:text-blue-600"
            >
              Sell
            </Link>
            <Link
              to="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-700 hover:text-blue-600"
            >
              My Account
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-700 hover:text-blue-600"
            >
              Cart
            </Link>
            <Link
              to="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-700 hover:text-blue-600"
            >
              Help
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="block text-left text-gray-700 hover:text-blue-600"
            >
              Logout
            </button>
          </div>
        )}
        {isAuthenticated && isCartOpen && (
          <div
            ref={mobileCartRef}
            className="sm:hidden border-t border-gray-200 py-3"
          >
            <div className="bg-white text-gray-900 border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">
                  Your Cart
                </h4>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
              {cartItems.length === 0 ? (
                <p className="text-sm text-gray-700">Your cart is empty.</p>
              ) : (
                <>
                  <div className="space-y-3 max-h-64 overflow-auto">
                    {cartItems.slice(0, 5).map((item) => (
                      <div
                        key={item.listingId}
                        className="flex items-center gap-3"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-12 h-12 rounded object-cover border border-gray-200"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            Qty {item.qty} · GHS{" "}
                            {(item.priceGhs * item.qty).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 mt-3 pt-3 text-sm text-gray-800 flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      GHS{" "}
                      {cartItems
                        .reduce(
                          (total, item) => total + item.priceGhs * item.qty,
                          0
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate("/cart");
                      }}
                      className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded hover:bg-gray-50"
                    >
                      View Cart
                    </button>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        if (!demoEnabled) {
                          navigate("/cart");
                          return;
                        }
                        navigate("/checkout");
                      }}
                      className={`flex-1 text-sm py-2 rounded ${
                        demoEnabled
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {demoEnabled ? "Checkout" : "Coming soon"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
