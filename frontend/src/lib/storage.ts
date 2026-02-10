import type { CartItem } from "../types";

const WATCHLIST_KEY = "storefront_watchlist";
const RECENTLY_VIEWED_KEY = "storefront_recently_viewed";
const TOKEN_KEY = "token";
const USER_KEY = "user";
const CART_KEY = "storefront_cart";

const emitCartUpdated = (cart: CartItem[]) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("cart:updated", { detail: { cart } }));
};

export const storage = {
  // Watchlist
  getWatchlist: (): number[] => {
    try {
      const data = localStorage.getItem(WATCHLIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToWatchlist: (listingId: number): void => {
    const watchlist = storage.getWatchlist();
    if (!watchlist.includes(listingId)) {
      watchlist.push(listingId);
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    }
  },

  removeFromWatchlist: (listingId: number): void => {
    const watchlist = storage.getWatchlist();
    const filtered = watchlist.filter((id) => id !== listingId);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered));
  },

  isInWatchlist: (listingId: number): boolean => {
    return storage.getWatchlist().includes(listingId);
  },

  // Recently viewed
  getRecentlyViewed: (): number[] => {
    try {
      const data = localStorage.getItem(RECENTLY_VIEWED_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToRecentlyViewed: (listingId: number): void => {
    const viewed = storage.getRecentlyViewed();
    const filtered = viewed.filter((id) => id !== listingId);
    const updated = [listingId, ...filtered].slice(0, 10); // Keep last 10
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  },

  // Token & User (for compatibility with AuthContext)
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser: (): any | null => {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // Cart
  getCart: (): CartItem[] => {
    try {
      const data = localStorage.getItem(CART_KEY);
      const parsed = data ? JSON.parse(data) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((item) => {
          if (item && typeof item === "object") {
            if ("quantity" in item && !("qty" in item)) {
              return { ...item, qty: item.quantity };
            }
          }
          return item;
        })
        .filter((item) => item && typeof item === "object");
    } catch {
      return [];
    }
  },

  setCart: (items: CartItem[]): void => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    emitCartUpdated(items);
  },

  addToCart: (item: CartItem): void => {
    const cart = storage.getCart();
    const existing = cart.find((entry) => entry.listingId === item.listingId);
    if (existing) {
      existing.qty = Math.max(1, existing.qty + item.qty);
      storage.setCart([...cart]);
      return;
    }
    storage.setCart([...cart, { ...item, qty: Math.max(1, item.qty) }]);
  },

  removeFromCart: (listingId: number): void => {
    const cart = storage.getCart();
    const updated = cart.filter((entry) => entry.listingId !== listingId);
    storage.setCart(updated);
  },

  updateCartQty: (listingId: number, qty: number): void => {
    const cart = storage.getCart();
    const updated = cart.map((entry) =>
      entry.listingId === listingId
        ? { ...entry, qty: Math.max(1, qty) }
        : entry
    );
    storage.setCart(updated);
  },

  clearCart: (): void => {
    storage.setCart([]);
  },
};
