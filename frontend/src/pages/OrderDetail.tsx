import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ordersApi, Order } from "../api/orders";
import { useAuth } from "../context/AuthContext";
import { ToastContainer } from "../components/ui/ToastContainer";
import { useToast } from "../hooks/useToast";
import { Container } from "../components/layout/Container";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    if (!id) return;
    setLoading(true);
    setError("");
    ordersApi
      .getById(Number(id))
      .then(({ order }) => {
        if (!isMounted) return;
        setOrder(order);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Unable to load order.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAction = async (action: "fulfillment" | "confirm" | "refund") => {
    if (!order || actionLoading) return;
    setActionLoading(true);
    try {
      const response =
        action === "fulfillment"
          ? await ordersApi.submitFulfillment(order.id)
          : action === "confirm"
          ? await ordersApi.confirm(order.id)
          : await ordersApi.refund(order.id);
      setOrder(response.order);
      showToast("Order updated", "success");
    } catch (err: any) {
      showToast(
        err.response?.data?.error?.message || "Unable to update order",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-600">Loading order...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-600">Unable to load order.</div>
      </div>
    );
  }

  const isBuyer = user?.id === order.buyerId;
  const isSeller = user?.id === order.sellerId;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Container className="py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-700 hover:text-blue-600"
          >
            ← Back
          </button>
          <Link to="/account/orders" className="text-sm text-blue-600">
            View all orders
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <div>
              <p className="text-sm text-gray-600">Order #{order.id}</p>
              <h1 className="text-2xl font-semibold text-gray-900 mt-1">
                {order.listingSnapshot?.title || "Order"}
              </h1>
              <p className="text-sm text-gray-700 mt-2">
                Qty {order.listingSnapshot?.qty}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-semibold text-gray-900">
                GHS {Number(order.totalGhs).toLocaleString()}
              </p>
              <span className="inline-block mt-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                {order.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Payment Summary
              </h2>
              <div className="space-y-2 text-sm text-gray-800">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>GHS {Number(order.subtotalGhs).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>GHS {Number(order.shippingGhs).toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>GHS {Number(order.totalGhs).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Demo Escrow Timeline
              </h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>Order placed</li>
                <li>
                  Escrow status:{" "}
                  <span className="font-medium text-gray-900">
                    {order.escrow?.status || "held"}
                  </span>
                </li>
                {order.escrow?.releasedAt && (
                  <li>
                    Released at{" "}
                    {new Date(order.escrow.releasedAt).toLocaleString()}
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Actions
              </h3>
              <div className="space-y-3">
                {isSeller && (
                  <button
                    onClick={() => handleAction("fulfillment")}
                    disabled={actionLoading}
                    className="w-full border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Mark Fulfillment Submitted
                  </button>
                )}
                {isBuyer && (
                  <>
                    <button
                      onClick={() => handleAction("confirm")}
                      disabled={actionLoading}
                      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Confirm Delivery (Release Escrow)
                    </button>
                    <button
                      onClick={() => handleAction("refund")}
                      disabled={actionLoading}
                      className="w-full border border-red-300 text-red-600 py-2 rounded hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Request Refund (Demo)
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              <strong>Demo mode:</strong> This order flow is simulated. No real
              payments are processed.
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
