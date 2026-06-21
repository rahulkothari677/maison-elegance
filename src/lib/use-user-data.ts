"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

type Address = {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: string;
  trackingNumber: string | null;
  createdAt: string;
  items: {
    id: string;
    productId: string;
    name: string;
    image: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
  }[];
};

type Review = {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  title: string | null;
  body: string;
  verified: boolean;
  createdAt: string;
};

type WishlistProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  rating: number;
  reviewCount: number;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  badge: string | null;
  shortDescription: string;
};

export function useUserData() {
  const { data: session, status } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = status === "authenticated" && !!session?.user;

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [addrRes, orderRes, wishRes] = await Promise.all([
        fetch("/api/addresses"),
        fetch("/api/orders"),
        fetch("/api/wishlist"),
      ]);
      if (addrRes.ok) {
        const data = await addrRes.json();
        setAddresses(data.addresses);
      }
      if (orderRes.ok) {
        const data = await orderRes.json();
        setOrders(data.orders);
      }
      if (wishRes.ok) {
        const data = await wishRes.json();
        setWishlist(data.items);
      }
    } catch (e) {
      console.error("Failed to fetch user data", e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Addresses
  const addAddress = async (addr: Omit<Address, "id">) => {
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addr),
    });
    if (!res.ok) throw new Error("Failed to add address");
    toast.success("Address added");
    refreshAll();
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    const res = await fetch(`/api/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update address");
    toast.success("Address updated");
    refreshAll();
  };

  const deleteAddress = async (id: string) => {
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete address");
    toast.success("Address removed");
    refreshAll();
  };

  // Wishlist
  const wishlistProductIds = wishlist.map((w) => w.id);
  const toggleWishlist = async (productId: string) => {
    if (wishlistProductIds.includes(productId)) {
      await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
      setWishlist((w) => w.filter((p) => p.id !== productId));
      toast.success("Removed from wishlist");
    } else {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      toast.success("Added to wishlist");
      refreshAll();
    }
  };

  // Profile
  const updateProfile = async (updates: any) => {
    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update profile");
    toast.success("Profile updated");
    // Reload to refresh session
    setTimeout(() => window.location.reload(), 500);
  };

  return {
    session,
    status,
    isAuthenticated,
    user: session?.user as any,
    addresses,
    orders,
    wishlist,
    wishlistProductIds,
    loading,
    refreshAll,
    addAddress,
    updateAddress,
    deleteAddress,
    toggleWishlist,
    updateProfile,
  };
}

// Hook for fetching product reviews
export function useProductReviews(slug: string | null) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${slug}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addReview = async (review: {
    rating: number;
    title?: string;
    body: string;
  }) => {
    const res = await fetch(`/api/products/${slug}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(review),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to submit review");
    }
    toast.success("Review submitted — thank you!");
    refresh();
  };

  return { reviews, loading, addReview, refresh };
}
