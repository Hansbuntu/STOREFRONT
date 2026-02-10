import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { storage } from "../lib/storage";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/ToastContainer";
import { Container } from "../components/layout/Container";

type CartItem = ReturnType<typeof storage.getCart>[number];

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();
  const demoEnabled = import.meta.env.VITE_DEMO_MODE === "true";

  useEffect(() => {
    const updateCart = () => setCart(storage.getCart());
    updateCart();
    window.addEventListener("cart:updated", updateCart as EventListener);
    window.addEventListener("storage", updateCart);
    return () => {
      window.removeEventListener("cart:updated", updateCart as EventListener);
      window.removeEventListener("storage", updateCart);
    };
  }, []);

  const subtotal = cart.reduce(
    (total, item) => total + item.priceGhs * item.qty,
    0
  );
  const shippingTotal = cart.reduce(
    (total, item) => total + (item.shippingFeeGhs || 0) * item.qty,
    0
  );
  const grandTotal = subtotal + shippingTotal;

  const handleQtyChange = (listingId: number, nextQty: number) => {
    storage.updateCartQty(listingId, nextQty);
    showToast("Quantity updated", "success");
  };

  const handleRemove = (listingId: number) => {
    storage.removeFromCart(listingId);
    showToast("Removed from cart", "info");
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <Container className="py-10">
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h1>
            <p className="text-sm text-gray-700 mb-6">
              Browse listings and add items to your cart to get started.
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

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Container className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Your Cart</h1>
          <button
            onClick={() => {
              storage.clearCart();
              showToast("Cart cleared", "info");
            }}
            className="text-sm text-gray-700 hover:text-blue-600"
          >
            Clear cart
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const maxQty = Math.max(1, item.qty);
              const shippingLabel = item.shippingFeeGhs
                ? `GHS ${item.shippingFeeGhs.toLocaleString()} shipping`
                : "Free shipping";

              return (
                <div
                  key={item.listingId}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row gap-4"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-24 h-24 rounded object-cover border border-gray-200"
                  />
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div>
                        <h2 className="text-base font-semibold text-gray-900">
                          {item.title}
                        </h2>
                        <p className="text-sm text-gray-700">
                          Seller: {item.sellerName}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-gray-700">Price</p>
                        <p className="text-base font-semibold text-gray-900">
                          GHS {item.priceGhs.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="text-sm text-gray-700">
                          Qty
                        </label>
                        <select
                          value={item.qty}
                          onChange={(e) =>
                            handleQtyChange(
                              item.listingId,
                              Number(e.target.value)
                            )
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-white"
                        >
                          {Array.from({ length: maxQty }, (_, index) => index + 1).map(
                            (qty) => (
                              <option key={qty} value={qty}>
                                {qty}
                              </option>
                            )
                          )}
                        </select>
                        <span className="text-xs text-gray-600">
                          {shippingLabel}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemove(item.listingId)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-800">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-medium text-gray-900">
                  GHS {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span className="text-gray-700">Shipping</span>
                <span className="font-medium text-gray-900">
                  GHS {shippingTotal.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>GHS {grandTotal.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (!demoEnabled) {
                  showToast("Checkout is coming soon.", "info");
                  return;
                }
                navigate("/checkout");
              }}
              className={`mt-5 w-full py-2.5 rounded ${
                demoEnabled
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {demoEnabled ? "Proceed to Checkout" : "Checkout coming soon"}
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
