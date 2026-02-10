import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sellerApi } from "../api/seller";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/ToastContainer";
import { Container } from "../components/layout/Container";
import { useAuth } from "../context/AuthContext";

export default function BecomeSeller() {
  const [loading, setLoading] = useState(false);
  const { toasts, showToast, removeToast } = useToast();
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleCreate = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await sellerApi.becomeSeller();
      if (response.token && response.user) {
        setAuth(response.token, response.user);
      }
      showToast("Seller profile created", "success");
      navigate("/seller/profile");
    } catch (err: any) {
      showToast(
        err.response?.data?.error?.message || "Unable to create seller profile",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Container className="py-10">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            Become a Seller
          </h1>
          <p className="text-sm text-gray-700 mb-6">
            STOREFRONT is a trusted marketplace. To sell, create a store profile,
            accept marketplace policies, and submit your profile for approval.
          </p>
          <ul className="text-sm text-gray-700 space-y-2 mb-6">
            <li>• Create a store name and description</li>
            <li>• Share a store location for buyers</li>
            <li>• Accept marketplace rules</li>
          </ul>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create my seller profile"}
          </button>
        </div>
      </Container>
    </div>
  );
}
