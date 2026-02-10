import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  fetchAdminSellers,
  fetchAdminActions,
  AdminSellerStatus,
  AdminSellerSummary,
  AdminAction,
} from "../api/admin";
import { Container } from "../components/layout/Container";
import { ToastContainer } from "../components/ui/ToastContainer";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<AdminSellerStatus>("pending");
  const [sellers, setSellers] = useState<AdminSellerSummary[]>([]);
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    const nextStatus = searchParams.get("status") as AdminSellerStatus | null;
    if (nextStatus && nextStatus !== status) {
      setStatus(nextStatus);
    }
    if (!nextStatus && status !== "pending") {
      setStatus("pending");
    }
  }, [searchParams, status]);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);
    fetchAdminSellers(status)
      .then((data) => {
        if (!mounted) return;
        setSellers(data);
      })
      .catch((err) => {
        if (!mounted) return;
        const message =
          err?.response?.data?.error?.message ||
          err?.message ||
          "Unable to load sellers.";
        setError(message);
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [status]);

  useEffect(() => {
    let mounted = true;
    fetchAdminActions(10)
      .then((data) => {
        if (!mounted) return;
        setActions(data);
      })
      .catch(() => {
        if (!mounted) return;
        setActions([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const tabs = useMemo(
    () => [
      { label: "Pending", value: "pending" as AdminSellerStatus },
      { label: "Verified", value: "verified" as AdminSellerStatus },
      { label: "Rejected", value: "rejected" as AdminSellerStatus },
      { label: "Draft", value: "draft" as AdminSellerStatus },
    ],
    []
  );

  return (
    <Container>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6 py-6">
        <section className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">Admin review</h1>
          <p className="text-sm text-gray-600">
            Review seller profiles, verify trust checks, and approve or reject
            store applications.
          </p>
        </section>

        <section className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setSearchParams({ status: tab.value });
                setStatus(tab.value);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                status === tab.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </section>

        <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              {tabs.find((tab) => tab.value === status)?.label} Sellers
            </h2>
            <span className="text-xs text-gray-500">
              {sellers.length} seller{sellers.length === 1 ? "" : "s"}
            </span>
          </div>

          {isLoading ? (
            <div className="px-4 py-6 text-sm text-gray-600">Loading...</div>
          ) : error ? (
            <div className="px-4 py-6 text-sm text-red-600">{error}</div>
          ) : sellers.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-600">
              No sellers found for this status.
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-gray-500 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Store</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Trust checks</th>
                      <th className="px-4 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellers.map((seller) => {
                      const descriptionOk =
                        (seller.sellerProfile.storeDescriptionLength ?? 0) >= 50;
                      const locationOk = !!seller.sellerProfile.storeLocation;
                      const policiesOk = seller.sellerProfile.policiesAccepted;
                      const completeness =
                        (Number(!!seller.sellerProfile.storeName) +
                          Number(descriptionOk) +
                          Number(locationOk) +
                          Number(policiesOk)) /
                        4;
                      const completenessLabel = `${Math.round(
                        completeness * 100
                      )}%`;
                      return (
                        <tr
                          key={seller.userId}
                          className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/admin/sellers/${seller.userId}`)}
                        >
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {seller.sellerProfile.storeName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {seller.sellerProfile.storeLocation}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-900">{seller.pseudonym}</div>
                          <div className="text-xs text-gray-500">
                            {seller.email ?? "No email"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-600">
                            Profile completeness:{" "}
                            <span
                              className={
                                completeness >= 0.75
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }
                            >
                              {completenessLabel}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            Policies:{" "}
                            <span
                              className={
                                seller.sellerProfile.policiesAccepted
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {seller.sellerProfile.policiesAccepted
                                ? "Accepted"
                                : "Missing"}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Account age:{" "}
                            {seller.createdAt
                              ? `${Math.max(
                                  0,
                                  Math.floor(
                                    (Date.now() -
                                      new Date(seller.createdAt).getTime()) /
                                      (1000 * 60 * 60 * 24)
                                  )
                                )} days`
                              : "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(
                            seller.sellerProfile.createdAt
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-gray-100">
                {sellers.map((seller) => (
                  <button
                    key={seller.userId}
                    onClick={() => navigate(`/admin/sellers/${seller.userId}`)}
                    className="w-full text-left px-4 py-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {seller.sellerProfile.storeName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {seller.sellerProfile.storeLocation}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(
                          seller.sellerProfile.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      {seller.pseudonym} • {seller.email ?? "No email"}
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      Policies:{" "}
                      <span
                        className={
                          seller.sellerProfile.policiesAccepted
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {seller.sellerProfile.policiesAccepted
                          ? "Accepted"
                          : "Missing"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Recent Admin Actions
            </h2>
            <span className="text-xs text-gray-500">{actions.length} actions</span>
          </div>
          {actions.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-600">
              No admin actions recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {actions.map((action) => (
                <div key={action.id} className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-gray-900">
                      {action.actionType.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(action.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Target: {action.targetType} #{action.targetId}
                  </div>
                  {action.reason && (
                    <div className="text-xs text-gray-500 mt-1">
                      Reason: {action.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Container>
  );
}

export default AdminDashboard;
