"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, SizeOption } from "./data";

export type View =
  | "home"
  | "shop"
  | "product"
  | "cart"
  | "wishlist"
  | "profile"
  | "checkout"
  | "orders"
  | "order-success"
  | "admin";

export type ProfileTab =
  | "overview"
  | "orders"
  | "addresses"
  | "payment"
  | "wishlist"
  | "loyalty"
  | "notifications"
  | "settings"
  | "recently-viewed";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: SizeOption;
  color: string;
  quantity: number;
};

export type Address = {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
};

export type PaymentMethod = {
  id: string;
  type: "visa" | "mastercard" | "amex";
  last4: string;
  expiry: string;
  name: string;
  isDefault: boolean;
};

export type OrderStatus =
  | "Processing"
  | "Confirmed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered";

export type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: {
    productId: string;
    name: string;
    image: string;
    size: SizeOption;
    color: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: string;
  trackingNumber?: string;
};

export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  avatar: string;
  memberSince: string;
  tier: "Silver" | "Gold" | "Platinum";
  loyaltyPoints: number;
  lifetimeSpend: number;
};

export type AppState = {
  view: View;
  selectedProductId: string | null;
  selectedCategory: string;
  profileTab: ProfileTab;
  lastViewedProductIds: string[];
  lastOrderId: string | null;

  // Cart drawer (slide-out)
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;

  // Quick view modal
  quickViewProductId: string | null;
  setQuickViewProduct: (id: string | null) => void;

  // Mobile nav
  mobileSearchOpen: boolean;

  // Cart
  cart: CartItem[];
  addToCart: (
    product: Product,
    size: SizeOption,
    color: string,
    quantity?: number
  ) => void;
  removeFromCart: (productId: string, size: SizeOption, color: string) => void;
  updateCartQty: (
    productId: string,
    size: SizeOption,
    color: string,
    qty: number
  ) => void;
  clearCart: () => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;

  // Navigation
  setView: (view: View) => void;
  openProduct: (productId: string) => void;
  setCategory: (category: string) => void;
  setProfileTab: (tab: ProfileTab) => void;

  // Profile
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;

  // Addresses
  addresses: Address[];
  addAddress: (addr: Omit<Address, "id">) => void;
  updateAddress: (id: string, updates: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Payment
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (pm: Omit<PaymentMethod, "id">) => void;
  deletePaymentMethod: (id: string) => void;
  setDefaultPayment: (id: string) => void;

  // Orders
  orders: Order[];
  placeOrder: (order: Omit<Order, "id" | "date">) => string;

  // Notifications
  notificationPrefs: {
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
    priceAlerts: boolean;
  };
  updateNotificationPrefs: (
    prefs: Partial<AppState["notificationPrefs"]>
  ) => void;
};

const defaultProfile: UserProfile = {
  name: "Isabella Laurent",
  email: "isabella.laurent@example.com",
  phone: "+1 (415) 555-0142",
  dob: "1992-04-18",
  gender: "Female",
  avatar:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  memberSince: "March 2021",
  tier: "Gold",
  loyaltyPoints: 2840,
  lifetimeSpend: 14250,
};

const defaultAddresses: Address[] = [
  {
    id: "addr-1",
    label: "Home",
    fullName: "Isabella Laurent",
    line1: "1184 Fillmore Street",
    line2: "Apt 4B",
    city: "San Francisco",
    state: "CA",
    postalCode: "94115",
    country: "United States",
    phone: "+1 (415) 555-0142",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Office",
    fullName: "Isabella Laurent",
    line1: "415 Mission Street",
    line2: "Floor 18",
    city: "San Francisco",
    state: "CA",
    postalCode: "94105",
    country: "United States",
    phone: "+1 (415) 555-0142",
    isDefault: false,
  },
];

const defaultPaymentMethods: PaymentMethod[] = [
  {
    id: "pm-1",
    type: "visa",
    last4: "4242",
    expiry: "08/27",
    name: "Isabella Laurent",
    isDefault: true,
  },
  {
    id: "pm-2",
    type: "amex",
    last4: "8431",
    expiry: "11/26",
    name: "Isabella Laurent",
    isDefault: false,
  },
];

const defaultOrders: Order[] = [
  {
    id: "ME-2483719",
    date: "2026-06-14",
    status: "Shipped",
    total: 689,
    items: [
      {
        productId: "p1",
        name: "Camille Wool-Blend Tailored Coat",
        image:
          "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=400&q=80",
        size: "S",
        color: "Camel",
        quantity: 1,
        price: 689,
      },
    ],
    shippingAddress: "1184 Fillmore Street, Apt 4B, San Francisco, CA 94115",
    trackingNumber: "1Z999AA10123456784",
  },
  {
    id: "ME-2483720",
    date: "2026-05-29",
    status: "Delivered",
    total: 530,
    items: [
      {
        productId: "p5",
        name: "Mira Structured Leather Tote",
        image:
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80",
        size: "ONE SIZE",
        color: "Cognac",
        quantity: 1,
        price: 525,
      },
    ],
    shippingAddress: "1184 Fillmore Street, Apt 4B, San Francisco, CA 94115",
    trackingNumber: "1Z999AA10123456790",
  },
  {
    id: "ME-2483721",
    date: "2026-04-12",
    status: "Delivered",
    total: 530,
    items: [
      {
        productId: "p3",
        name: "Edmonton Cashmere Crewneck",
        image:
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=400&q=80",
        size: "M",
        color: "Oat",
        quantity: 1,
        price: 285,
      },
      {
        productId: "p7",
        name: "Heritage Oxford Cloth Shirt",
        image:
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&q=80",
        size: "M",
        color: "Pale Blue",
        quantity: 1,
        price: 145,
      },
    ],
    shippingAddress: "1184 Fillmore Street, Apt 4B, San Francisco, CA 94115",
  },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: "home",
      selectedProductId: null,
      selectedCategory: "all",
      profileTab: "overview",
      lastViewedProductIds: [],
      lastOrderId: null,

      cartDrawerOpen: false,
      setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),

      quickViewProductId: null,
      setQuickViewProduct: (id) => set({ quickViewProductId: id }),

      mobileSearchOpen: false,

      cart: [],
      addToCart: (product, size, color, quantity = 1) =>
        set((state) => {
          const existing = state.cart.find(
            (i) =>
              i.productId === product.id &&
              i.size === size &&
              i.color === color
          );
          let newCart: CartItem[];
          if (existing) {
            newCart = state.cart.map((i) =>
              i === existing ? { ...i, quantity: i.quantity + quantity } : i
            );
          } else {
            newCart = [
              ...state.cart,
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.images[0],
                size,
                color,
                quantity,
              },
            ];
          }
          return {
            cart: newCart,
            cartDrawerOpen: true,
          };
        }),
      removeFromCart: (productId, size, color) =>
        set((state) => ({
          cart: state.cart.filter(
            (i) =>
              !(i.productId === productId && i.size === size && i.color === color)
          ),
        })),
      updateCartQty: (productId, size, color, qty) =>
        set((state) => ({
          cart: state.cart
            .map((i) =>
              i.productId === productId && i.size === size && i.color === color
                ? { ...i, quantity: Math.max(1, qty) }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),
      clearCart: () => set({ cart: [] }),

      wishlist: [],
      toggleWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        })),

      setView: (view) => {
        set({ view });
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },
      openProduct: (productId) => {
        set((state) => ({
          view: "product",
          selectedProductId: productId,
          lastViewedProductIds: [
            productId,
            ...state.lastViewedProductIds.filter((id) => id !== productId),
          ].slice(0, 8),
        }));
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },
      setCategory: (category) => set({ selectedCategory: category }),
      setProfileTab: (tab) => set({ profileTab: tab }),

      // Profile (legacy — used when not authenticated; real auth uses session via useUserData)
      profile: defaultProfile,
      updateProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),

      // Addresses / Orders / Payment — API-driven for authed users (see useUserData hook)
      // Store keeps empty defaults; ProfileView merges API data when authenticated
      addresses: [],
      addAddress: (addr) =>
        set((state) => ({
          addresses: [
            ...state.addresses.map((a) =>
              addr.isDefault ? { ...a, isDefault: false } : a
            ),
            { ...addr, id: `addr-${Date.now()}` },
          ],
        })),
      updateAddress: (id, updates) =>
        set((state) => ({
          addresses: state.addresses.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),
      deleteAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id),
        })),
      setDefaultAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        })),

      paymentMethods: defaultPaymentMethods,
      addPaymentMethod: (pm) =>
        set((state) => ({
          paymentMethods: [
            ...state.paymentMethods.map((p) =>
              pm.isDefault ? { ...p, isDefault: false } : p
            ),
            { ...pm, id: `pm-${Date.now()}` },
          ],
        })),
      deletePaymentMethod: (id) =>
        set((state) => ({
          paymentMethods: state.paymentMethods.filter((p) => p.id !== id),
        })),
      setDefaultPayment: (id) =>
        set((state) => ({
          paymentMethods: state.paymentMethods.map((p) => ({
            ...p,
            isDefault: p.id === id,
          })),
        })),

      orders: [],
      placeOrder: (order) => {
        const id = `ME-${Math.floor(Math.random() * 9000000) + 1000000}`;
        const newOrder: Order = {
          ...order,
          id,
          date: new Date().toISOString().split("T")[0],
        };
        set((state) => ({
          orders: [newOrder, ...state.orders],
          cart: [],
          lastOrderId: id,
        }));
        return id;
      },

      notificationPrefs: {
        orderUpdates: true,
        promotions: true,
        newsletter: false,
        priceAlerts: true,
      },
      updateNotificationPrefs: (prefs) =>
        set((state) => ({
          notificationPrefs: { ...state.notificationPrefs, ...prefs },
        })),
    }),
    {
      name: "maison-elegance-store",
      partialize: (state) => ({
        cart: state.cart,
        // Local wishlist fallback only — authed users use API
        wishlist: state.wishlist,
        notificationPrefs: state.notificationPrefs,
        lastViewedProductIds: state.lastViewedProductIds,
      }),
    }
  )
);

// Selectors / helpers
export const cartCount = (cart: CartItem[]) =>
  cart.reduce((sum, i) => sum + i.quantity, 0);

export const cartSubtotal = (cart: CartItem[]) =>
  cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
