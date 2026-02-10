export interface Listing {
  id: number;
  title: string;
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
  condition: "new" | "like_new" | "good" | "fair" | "poor";
  imageUrl: string;
  sellerId: number;
  seller?: {
    id: number;
    pseudonym: string;
    sellerProfileStatus?: "draft" | "pending" | "verified" | "rejected" | null;
  } | null;
  createdAt: string;
  deliveryLabel: string;
  shippingFeeGhs?: number;
  escrowProtected: boolean;
  quantity: number;
  description?: string;
  images?: {
    id: number;
    url: string;
    sortOrder?: number;
  }[];
}

export interface Seller {
  id: number;
  pseudonym: string;
  ratingAvg: number;
  feedbackCount: number;
  verified: boolean;
  memberSince: string;
  responseTime?: string;
}

export interface Feedback {
  id: number;
  sellerId: number;
  stars: number;
  comment: string;
  createdAt: string;
  buyerPseudonym?: string;
}

export interface CartItem {
  listingId: number;
  qty: number;
  priceGhs: number;
  shippingFeeGhs?: number;
  title: string;
  imageUrl: string;
  sellerId: number;
  sellerName: string;
}

export type ViewMode = "list" | "grid";
export type SortOption = "best_match" | "price_low" | "price_high" | "newest" | "top_rated";
