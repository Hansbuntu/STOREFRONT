import { apiClient } from "./client";
import { Listing } from "../types";

export interface ListingApiResponse {
  id: number;
  sellerId: number;
  title: string;
  description: string | null;
  brand?: string | null;
  model?: string | null;
  sku?: string | null;
  conditionDetails?: string | null;
  color?: string | null;
  size?: string | null;
  material?: string | null;
  weightKg?: number | null;
  dimensions?: string | null;
  warranty?: string | null;
  returnPolicy?: string | null;
  shippingMethod?: string | null;
  handlingTimeDays?: number | null;
  tags?: string[] | null;
  itemSpecifics?: Record<string, string> | null;
  priceGhs: number;
  location: string;
  condition: string;
  imageUrl: string | null;
  shippingFeeGhs: number;
  quantity: number;
  escrowProtected: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: number;
    pseudonym: string;
    sellerProfileStatus?: "draft" | "pending" | "verified" | "rejected" | null;
  } | null;
  images?: {
    id: number;
    url: string;
    sortOrder?: number;
  }[];
}

const conditionMap: Record<string, Listing["condition"]> = {
  new: "new",
  used_like_new: "like_new",
  used_good: "good",
  used_fair: "fair",
};

const formatDeliveryLabel = (shippingFeeGhs?: number) => {
  if (shippingFeeGhs && shippingFeeGhs > 0) {
    return `GHS ${shippingFeeGhs.toLocaleString()} delivery`;
  }
  return "Delivery calculated at checkout";
};

export const mapListingFromApi = (listing: ListingApiResponse): Listing => {
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const normalizeUrl = (url: string) =>
    url.startsWith("/public/") ? `${apiBase}${url}` : url;

  return {
    id: listing.id,
    title: listing.title,
    brand: listing.brand ?? null,
    model: listing.model ?? null,
    sku: listing.sku ?? null,
    conditionDetails: listing.conditionDetails ?? null,
    color: listing.color ?? null,
    size: listing.size ?? null,
    material: listing.material ?? null,
    weightKg: listing.weightKg ?? null,
    dimensions: listing.dimensions ?? null,
    warranty: listing.warranty ?? null,
    returnPolicy: listing.returnPolicy ?? null,
    shippingMethod: listing.shippingMethod ?? null,
    handlingTimeDays: listing.handlingTimeDays ?? null,
    tags: listing.tags ?? null,
    itemSpecifics: listing.itemSpecifics ?? null,
    priceGhs: listing.priceGhs,
    location: listing.location,
    condition: conditionMap[listing.condition] || "good",
    imageUrl:
      listing.imageUrl
        ? normalizeUrl(listing.imageUrl)
        : "https://via.placeholder.com/200x200?text=Listing",
    sellerId: listing.sellerId,
    seller: listing.seller ?? null,
    createdAt: listing.createdAt,
    deliveryLabel: formatDeliveryLabel(listing.shippingFeeGhs),
    escrowProtected: listing.escrowProtected,
    quantity: listing.quantity,
    description: listing.description || undefined,
    shippingFeeGhs: listing.shippingFeeGhs,
    images: listing.images
      ? listing.images.map((image) => ({
          ...image,
          url: normalizeUrl(image.url),
        }))
      : [],
  };
};

export const listingsApi = {
  list: async (params?: {
    q?: string;
    sellerId?: number;
    sort?: "newest" | "price_asc" | "price_desc";
    minPrice?: number;
    maxPrice?: number;
  }): Promise<{ listings: Listing[] }> => {
    const res = await apiClient.get<{ listings: ListingApiResponse[] }>(
      "/listings",
      { params }
    );
    return {
      listings: res.data.listings.map(mapListingFromApi),
    };
  },
  getById: async (id: number): Promise<{ listing: Listing }> => {
    const res = await apiClient.get<{ listing: ListingApiResponse }>(
      `/listings/${id}`
    );
    return { listing: mapListingFromApi(res.data.listing) };
  },
  create: async (payload: {
    title: string;
    description?: string;
    brand?: string;
    model?: string;
    sku?: string;
    conditionDetails?: string;
    color?: string;
    size?: string;
    material?: string;
    weightKg?: number;
    dimensions?: string;
    warranty?: string;
    returnPolicy?: string;
    shippingMethod?: string;
    handlingTimeDays?: number;
    tags?: string[];
    itemSpecifics?: Record<string, string>;
    priceGhs: number;
    location: string;
    condition: string;
    shippingFeeGhs?: number;
    quantity?: number;
  }) => {
    const res = await apiClient.post<{ listing: ListingApiResponse }>(
      "/listings",
      payload
    );
    return { listing: mapListingFromApi(res.data.listing) };
  },
  update: async (id: number, payload: Partial<{
    title: string;
    description: string;
    brand: string;
    model: string;
    sku: string;
    conditionDetails: string;
    color: string;
    size: string;
    material: string;
    weightKg: number;
    dimensions: string;
    warranty: string;
    returnPolicy: string;
    shippingMethod: string;
    handlingTimeDays: number;
    tags: string[];
    itemSpecifics: Record<string, string>;
    priceGhs: number;
    location: string;
    condition: string;
    shippingFeeGhs: number;
    quantity: number;
  }>) => {
    const res = await apiClient.patch<{ listing: ListingApiResponse }>(
      `/listings/${id}`,
      payload
    );
    return { listing: mapListingFromApi(res.data.listing) };
  },
  remove: async (id: number) => {
    await apiClient.delete(`/listings/${id}`);
  },
  uploadImages: async (id: number, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    const res = await apiClient.post<{ images: { id: number; url: string }[] }>(
      `/listings/${id}/images`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const normalizeUrl = (url: string) =>
      url.startsWith("/public/") ? `${apiBase}${url}` : url;
    return {
      images: res.data.images.map((image) => ({
        ...image,
        url: normalizeUrl(image.url),
      })),
    };
  },
  deleteImage: async (listingId: number, imageId: number) => {
    await apiClient.delete(`/listings/${listingId}/images/${imageId}`);
  },
  clearImages: async (listingId: number) => {
    await apiClient.delete(`/listings/${listingId}/images`);
  },
};
