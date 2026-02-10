import { useEffect, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/ToastContainer";
import { listingsApi } from "../api/listings";
import { sellerApi } from "../api/seller";
import { Container } from "../components/layout/Container";

export default function Sell() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();
  const [status, setStatus] = useState<{
    role: string;
    sellerProfileStatus: string;
  } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    model: "",
    sku: "",
    price: "",
    condition: "new",
    conditionDetails: "",
    location: "",
    description: "",
    quantity: "1",
    color: "",
    size: "",
    material: "",
    weightKg: "",
    dimensions: "",
    warranty: "",
    tags: "",
  });
  const [itemSpecifics, setItemSpecifics] = useState<
    { key: string; value: string }[]
  >([{ key: "", value: "" }]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    let isMounted = true;
    sellerApi
      .status()
      .then((data) => {
        if (!isMounted) return;
        setStatus(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setStatus({ role: user?.role || "buyer", sellerProfileStatus: "draft" });
      })
      .finally(() => {
        if (!isMounted) return;
        setLoadingStatus(false);
      });
    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (imagePreviews.length > 0) {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    }
    const previews = selectedImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedImages]);

  const isSeller = status?.role === "seller" || status?.role === "admin";
  const isVerified = status?.sellerProfileStatus === "verified";
  const isPending = status?.sellerProfileStatus === "pending";
  const isRejected = status?.sellerProfileStatus === "rejected";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      if (tags.length === 0) {
        showToast("Please add at least one tag.", "error");
        setSubmitting(false);
        return;
      }
      if (selectedImages.length === 0) {
        showToast("Please upload at least one product image.", "error");
        setSubmitting(false);
        return;
      }
      const specificsRecord = itemSpecifics.reduce<Record<string, string>>(
        (acc, item) => {
          if (!item.key.trim() || !item.value.trim()) return acc;
          acc[item.key.trim()] = item.value.trim();
          return acc;
        },
        {}
      );

      const response = await listingsApi.create({
        title: formData.title,
        description: formData.description,
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        sku: formData.sku || undefined,
        conditionDetails: formData.conditionDetails || undefined,
        color: formData.color || undefined,
        size: formData.size || undefined,
        material: formData.material || undefined,
        weightKg: formData.weightKg ? Number(formData.weightKg) : undefined,
        dimensions: formData.dimensions || undefined,
        warranty: formData.warranty || undefined,
        tags: tags.length > 0 ? tags : undefined,
        itemSpecifics:
          Object.keys(specificsRecord).length > 0
            ? specificsRecord
            : undefined,
        priceGhs: Number(formData.price),
        location: formData.location,
        condition: formData.condition,
        quantity: Number(formData.quantity),
      });

      if (selectedImages.length > 0) {
        await listingsApi.uploadImages(response.listing.id, selectedImages);
      }

      showToast("Listing created successfully.", "success");
      navigate(`/listing/${response.listing.id}`);
    } catch (err: any) {
      showToast(
        err.response?.data?.error?.message || "Unable to create listing",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (files: FileList | null) => {
    if (!files) return;
    setSelectedImages(Array.from(files));
  };

  const updateSpecific = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    setItemSpecifics((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addSpecificRow = () => {
    setItemSpecifics((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeSpecificRow = (index: number) => {
    setItemSpecifics((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Container className="py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Sell an Item
          </h1>
          {!isSeller && !loadingStatus && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
              <p className="text-sm text-yellow-800 mb-3">
                You need to become a verified seller to list items.
              </p>
              <Link
                to="/become-seller"
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                Become a Seller
              </Link>
            </div>
          )}
          {isSeller && isPending && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
              <p className="text-sm text-blue-800 mb-1">
                Your seller profile is under review.
              </p>
              <p className="text-xs text-blue-700">
                We will contact you within 2–3 days after approval.
              </p>
            </div>
          )}
          {isSeller && isRejected && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
              <p className="text-sm text-red-700 mb-3">
                Your seller profile was rejected. Update your profile and
                resubmit for review.
              </p>
              <Link
                to="/seller/profile"
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                Update Seller Profile
              </Link>
            </div>
          )}
          {isSeller && !isVerified && !isPending && !isRejected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
              <p className="text-sm text-yellow-800 mb-3">
                Your seller account needs verification before you can publish
                listings.
              </p>
              <Link
                to="/seller/profile"
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                Complete Seller Profile
              </Link>
            </div>
          )}
          {isSeller && isVerified && (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                <h2 className="text-sm font-semibold text-gray-900">Basics</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    maxLength={100}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-semibold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) =>
                        setFormData({ ...formData, model: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-semibold text-gray-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-semibold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition *
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) =>
                        setFormData({ ...formData, condition: e.target.value })
                      }
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-semibold text-gray-900"
                    >
                      <option value="new">New</option>
                      <option value="used_like_new">Like New</option>
                      <option value="used_good">Good</option>
                      <option value="used_fair">Fair</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition details
                  </label>
                  <textarea
                    value={formData.conditionDetails}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        conditionDetails: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-semibold text-gray-900"
                  />
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                <h2 className="text-sm font-semibold text-gray-900">
                  Pricing & Inventory
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (GHS) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-semibold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      min="1"
                      step="1"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-semibold text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                <h2 className="text-sm font-semibold text-gray-900">
                  Product details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-semibold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size
                    </label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) =>
                        setFormData({ ...formData, size: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-semibold text-gray-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material
                    </label>
                    <input
                      type="text"
                      value={formData.material}
                      onChange={(e) =>
                        setFormData({ ...formData, material: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-semibold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={formData.weightKg}
                      onChange={(e) =>
                        setFormData({ ...formData, weightKg: e.target.value })
                      }
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-semibold text-gray-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      value={formData.dimensions}
                      onChange={(e) =>
                        setFormData({ ...formData, dimensions: e.target.value })
                      }
                      placeholder="L x W x H"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-semibold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warranty
                    </label>
                    <input
                      type="text"
                      value={formData.warranty}
                      onChange={(e) =>
                        setFormData({ ...formData, warranty: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-semibold text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                <h2 className="text-sm font-semibold text-gray-900">
                  Item specifics
                </h2>
                <div className="space-y-3">
                  {itemSpecifics.map((item, index) => (
                    <div
                      key={`specific-${index}`}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Key (e.g. Style)"
                        value={item.key}
                        onChange={(e) =>
                          updateSpecific(index, "key", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. Vintage)"
                        value={item.value}
                        onChange={(e) =>
                          updateSpecific(index, "value", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecificRow(index)}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-red-600"
                        disabled={itemSpecifics.length === 1}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addSpecificRow}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Add another specific
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                <h2 className="text-sm font-semibold text-gray-900">
                  Description & Tags
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    rows={4}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated) *
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                  />
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                <h2 className="text-sm font-semibold text-gray-900">Images</h2>
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => handleImageChange(e.target.files)}
                  className="text-sm text-gray-700"
                />
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {imagePreviews.map((src, index) => (
                      <div
                        key={`preview-${index}`}
                        className="aspect-square border border-gray-200 rounded overflow-hidden bg-gray-50"
                      >
                        <img
                          src={src}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-5 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {submitting ? "Creating..." : "Create listing"}
                </button>
                <Link
                  to="/seller/portal"
                  className="border border-gray-300 text-gray-700 px-5 py-2 rounded text-sm hover:bg-gray-50"
                >
                  Back to Seller Portal
                </Link>
              </div>
            </form>
          )}
        </div>
      </Container>
    </div>
  );
}
