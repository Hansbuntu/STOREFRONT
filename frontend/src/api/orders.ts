import { apiClient } from "./client";

export interface DemoCheckoutItem {
  listingId: number;
  qty: number;
}

export interface DemoCheckoutResponse {
  orders: {
    id: number;
    sellerId: number;
    totalGhs: number;
  }[];
}

export interface Order {
  id: number;
  buyerId: number;
  sellerId: number;
  status: string;
  subtotalGhs: number;
  shippingGhs: number;
  totalGhs: number;
  currency: string;
  listingSnapshot: {
    listingId: number;
    title: string;
    priceGhs: number;
    shippingFeeGhs: number;
    qty: number;
    imageUrl?: string | null;
    location?: string;
  };
  createdAt: string;
  escrow?: {
    id: number;
    status: string;
    amount: number;
    releasedAt?: string | null;
    releasedTo?: "seller" | "buyer" | null;
  } | null;
}

export const ordersApi = {
  demoCheckout: async (items: DemoCheckoutItem[]) => {
    const res = await apiClient.post<DemoCheckoutResponse>("/demo/checkout", {
      items,
    });
    return res.data;
  },
  list: async () => {
    const res = await apiClient.get<{ orders: Order[] }>("/orders");
    return res.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get<{ order: Order }>(`/orders/${id}`);
    return res.data;
  },
  submitFulfillment: async (id: number) => {
    const res = await apiClient.post<{ order: Order }>(
      `/orders/${id}/fulfillment`
    );
    return res.data;
  },
  confirm: async (id: number) => {
    const res = await apiClient.post<{ order: Order }>(
      `/orders/${id}/confirm`
    );
    return res.data;
  },
  refund: async (id: number) => {
    const res = await apiClient.post<{ order: Order }>(
      `/orders/${id}/refund`
    );
    return res.data;
  },
};
