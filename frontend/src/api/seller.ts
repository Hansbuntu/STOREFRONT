import { apiClient } from "./client";

export interface SellerProfile {
  id: number;
  userId: number;
  storeName: string;
  storeDescription: string;
  storeLocation: string;
  contactEmail: string | null;
  contactPhone: string | null;
  policiesAccepted: boolean;
  status: "draft" | "pending" | "verified" | "rejected";
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const sellerApi = {
  becomeSeller: async () => {
    const res = await apiClient.post<{
      sellerProfile: SellerProfile;
      token: string;
      user: {
        id: number;
        pseudonym: string;
        email: string | null;
        role: "buyer" | "seller" | "admin" | "mediator";
        kycStatus: "unverified" | "pending" | "verified" | "rejected";
        createdAt: string;
      };
    }>("/seller/become");
    return res.data;
  },
  getProfile: async () => {
    const res = await apiClient.get<{ sellerProfile: SellerProfile }>(
      "/seller/profile/me"
    );
    return res.data;
  },
  updateProfile: async (payload: {
    storeName: string;
    storeDescription: string;
    storeLocation: string;
    contactEmail?: string | null;
    contactPhone?: string | null;
    policiesAccepted?: boolean;
  }) => {
    const res = await apiClient.put<{ sellerProfile: SellerProfile }>(
      "/seller/profile/me",
      payload
    );
    return res.data;
  },
  submitProfile: async () => {
    const res = await apiClient.post<{ sellerProfile: SellerProfile }>(
      "/seller/profile/submit"
    );
    return res.data;
  },
  status: async () => {
    const res = await apiClient.get<{
      role: string;
      emailVerified: boolean;
      phoneVerified: boolean;
      sellerProfileStatus: string;
      adminNotes?: string | null;
    }>("/seller/status");
    return res.data;
  },
};
