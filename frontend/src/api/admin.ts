import { apiClient } from "./client";

export type AdminSellerStatus = "pending" | "verified" | "rejected" | "draft";

export interface AdminSellerSummary {
  userId: number;
  pseudonym: string;
  email: string | null;
  emailVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
  createdAt?: string | null;
  sellerProfile: {
    storeName: string;
    storeLocation: string;
    status: AdminSellerStatus;
    createdAt: string;
    policiesAccepted?: boolean;
    storeDescriptionLength?: number;
  };
}

export interface AdminSellerDetail {
  userId: number;
  pseudonym: string;
  email: string | null;
  emailVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
  createdAt?: string | null;
  sellerProfile: {
    storeName: string;
    storeDescription: string;
    storeLocation: string;
    contactEmail: string | null;
    contactPhone: string | null;
    policiesAccepted: boolean;
    status: AdminSellerStatus;
    adminNotes: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface AdminAction {
  id: number;
  admin: { id: number; pseudonym: string; email: string | null } | null;
  actionType: string;
  targetType: string;
  targetId: number;
  reason: string | null;
  createdAt: string;
}

export interface AdminListing {
  id: number;
  title: string;
  priceGhs: number;
  status: string;
  createdAt: string;
  sellerId: number;
  seller: { id: number; pseudonym: string; email: string | null } | null;
  images: { id: number; url: string; sortOrder?: number }[];
}

export async function fetchAdminSellers(status?: AdminSellerStatus) {
  const response = await apiClient.get("/admin/sellers", {
    params: status ? { status } : undefined,
  });
  return response.data.sellers as AdminSellerSummary[];
}

export async function fetchAdminSeller(userId: number) {
  const response = await apiClient.get(`/admin/sellers/${userId}`);
  return response.data as AdminSellerDetail;
}

export async function approveAdminSeller(userId: number) {
  const response = await apiClient.patch(`/admin/sellers/${userId}/approve`);
  return response.data as { status: AdminSellerStatus };
}

export async function rejectAdminSeller(userId: number, reason: string) {
  const response = await apiClient.patch(`/admin/sellers/${userId}/reject`, {
    reason,
  });
  return response.data as { status: AdminSellerStatus; adminNotes?: string };
}

export async function fetchAdminActions(limit = 20) {
  const response = await apiClient.get("/admin/actions", {
    params: { limit },
  });
  return response.data.actions as AdminAction[];
}

export async function fetchAdminListings(sellerId?: number) {
  const response = await apiClient.get("/admin/listings", {
    params: sellerId ? { sellerId } : undefined,
  });
  return response.data.listings as AdminListing[];
}

export async function pauseAdminListing(id: number) {
  const response = await apiClient.patch(`/admin/listings/${id}/pause`);
  return response.data as { id: number; status: string };
}

export async function enableAdminListing(id: number) {
  const response = await apiClient.patch(`/admin/listings/${id}/enable`);
  return response.data as { id: number; status: string };
}
