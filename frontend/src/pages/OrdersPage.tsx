import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi, Order } from "../api/orders";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/ToastContainer";
import { Container } from "../components/layout/Container";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");
    ordersApi
      .list()
      .then(({ orders: data }) => {
        if (!isMounted) return;
        setOrders(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Unable to load orders.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Container className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Your Orders</h1>
          <Link
            to="/"
            className="text-sm text-blue-600 hover:underline"
          >
            Continue shopping
          </Link>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded p-8 text-center text-gray-700">
            Loading orders...
          </div>
        ) : error ? (
          <div className="bg-white border border-gray-200 rounded p-8 text-center text-gray-700">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded p-8 text-center">
            <p className="text-gray-700 mb-4">
              You do not have any orders yet.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm text-gray-600">
                    Order #{order.id}
                  </p>
                  <h2 className="text-base font-semibold text-gray-900">
                    {order.listingSnapshot?.title || "Order"}
                  </h2>
                  <p className="text-xs text-gray-600">
                    Qty {order.listingSnapshot?.qty} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <span className="inline-block mt-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-base font-semibold text-gray-900">
                    GHS {Number(order.totalGhs).toLocaleString()}
                  </p>
                  <Link
                    to={`/orders/${order.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
