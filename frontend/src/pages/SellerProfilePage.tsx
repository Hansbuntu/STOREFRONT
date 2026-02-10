import { useEffect, useState } from "react";
import { sellerApi, SellerProfile } from "../api/seller";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/ToastContainer";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Container } from "../components/layout/Container";

export default function SellerProfilePage() {
  const navigate = useNavigate();
  const { user, setAuth } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [missingProfile, setMissingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({
    storeName: "",
    storeDescription: "",
    storeLocation: "",
    contactEmail: "",
    contactPhone: "",
    policiesAccepted: false,
  });

  useEffect(() => {
    let isMounted = true;
    sellerApi
      .getProfile()
      .then((profileResponse) => {
        if (!isMounted) return;
        const sellerProfile = profileResponse.sellerProfile;
        setProfile(sellerProfile);
        setFormState({
          storeName: sellerProfile.storeName || "",
          storeDescription: sellerProfile.storeDescription || "",
          storeLocation: sellerProfile.storeLocation || "",
          contactEmail: sellerProfile.contactEmail || "",
          contactPhone: sellerProfile.contactPhone || "",
          policiesAccepted: sellerProfile.policiesAccepted,
        });
      })
      .catch((err: any) => {
        if (!isMounted) return;
        if (err.response?.status === 404) {
          setMissingProfile(true);
          return;
        }
        showToast("Unable to load profile", "error");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const response = await sellerApi.updateProfile({
        storeName: formState.storeName,
        storeDescription: formState.storeDescription,
        storeLocation: formState.storeLocation,
        contactEmail: formState.contactEmail || null,
        contactPhone: formState.contactPhone || null,
        policiesAccepted: formState.policiesAccepted,
      });
      setProfile(response.sellerProfile);
      showToast("Profile saved", "success");
    } catch (err: any) {
      showToast(
        err.response?.data?.error?.message || "Unable to save profile",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (missingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-700 mb-4">
            You have not created a seller profile yet.
          </p>
          <Link
            to="/become-seller"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            Become a Seller
          </Link>
        </div>
      </div>
    );
  }

  const statusLabel = profile?.status || "draft";

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Container className="py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Seller Profile
              </h1>
              <p className="text-sm text-gray-700">
                Complete your store profile to get verified and start listing.
              </p>
            </div>
            <span className="inline-block text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded">
              Status: {statusLabel}
            </span>
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
            After you submit, our admin team will review your seller profile.
            We will contact you within 2–3 days.
          </div>
          {profile?.adminNotes && statusLabel === "rejected" && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
              Admin notes: {profile.adminNotes}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store name
              </label>
              <input
                type="text"
                value={formState.storeName}
                onChange={(event) =>
                  setFormState({ ...formState, storeName: event.target.value })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store description
              </label>
              <textarea
                rows={5}
                value={formState.storeDescription}
                onChange={(event) =>
                  setFormState({
                    ...formState,
                    storeDescription: event.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store location
              </label>
              <input
                type="text"
                value={formState.storeLocation}
                onChange={(event) =>
                  setFormState({
                    ...formState,
                    storeLocation: event.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact email (private)
                </label>
                <input
                  type="email"
                  value={formState.contactEmail}
                  onChange={(event) =>
                    setFormState({
                      ...formState,
                      contactEmail: event.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact phone (private)
                </label>
                <input
                  type="text"
                  value={formState.contactPhone}
                  onChange={(event) =>
                    setFormState({
                      ...formState,
                      contactPhone: event.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formState.policiesAccepted}
                onChange={(event) =>
                  setFormState({
                    ...formState,
                    policiesAccepted: event.target.checked,
                  })
                }
              />
              I accept the marketplace policies
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save draft"}
            </button>
            <button
              onClick={async () => {
                if (saving) return;
                setSaving(true);
                try {
                  const response = await sellerApi.becomeSeller();
                  if (response.token && response.user) {
                    setAuth(response.token, response.user);
                  }
                  const saved = await sellerApi.updateProfile({
                    storeName: formState.storeName,
                    storeDescription: formState.storeDescription,
                    storeLocation: formState.storeLocation,
                    contactEmail: formState.contactEmail || null,
                    contactPhone: formState.contactPhone || null,
                    policiesAccepted: formState.policiesAccepted,
                  });
                  setProfile(saved.sellerProfile);
                  const submitResponse = await sellerApi.submitProfile();
                  setProfile(submitResponse.sellerProfile);
                  navigate("/seller/confirmation");
                } catch (err: any) {
                  showToast(
                    err.response?.data?.error?.message ||
                      "Unable to submit profile",
                    "error"
                  );
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              className="w-full sm:w-auto sm:min-w-[200px] bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Submitting..." : "Submit for verification"}
            </button>
            <Link
              to="/sell"
              className="w-full sm:w-auto px-4 py-2 border border-blue-600 text-blue-700 rounded hover:bg-blue-50 text-center"
            >
              Go to listing creation
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
