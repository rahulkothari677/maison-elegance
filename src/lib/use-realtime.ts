"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

// Singleton socket — only one connection per browser tab
let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;
  if (!socket) {
    socket = io("/?XTransformPort=3003", {
      transports: ["websocket", "polling"],
      forceNew: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on("connect", () => {
      console.log("📡 Connected to order tracker");
    });

    socket.on("disconnect", () => {
      console.log("📡 Disconnected from order tracker");
    });

    socket.on("connect_error", (err) => {
      console.warn("📡 Order tracker connection failed:", err.message);
    });
  }
  return socket;
}

// Hook for tracking a specific order
export function useOrderTracking(orderNumber: string | null) {
  const [lastUpdate, setLastUpdate] = useState<any>(null);

  useEffect(() => {
    if (!orderNumber) return;
    const s = getSocket();
    if (!s) return;

    const handleConnect = () => {
      s.emit("track:order", orderNumber);
    };

    const handleStatusChange = (payload: any) => {
      setLastUpdate(payload);
      toast.success("Order status updated", {
        description: `Order ${payload.orderNumber} is now ${payload.status}`,
      });
    };

    if (s.connected) {
      handleConnect();
    } else {
      s.once("connect", handleConnect);
    }

    s.on("order:status-changed", handleStatusChange);

    return () => {
      s.off("connect", handleConnect);
      s.off("order:status-changed", handleStatusChange);
      s.emit("untrack:order", orderNumber);
    };
  }, [orderNumber]);

  return { lastUpdate };
}

// Hook for admin — listens to ALL order updates
export function useAdminOrderUpdates(enabled: boolean) {
  const [updates, setUpdates] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const s = getSocket();
    if (!s) return;

    const handleConnect = () => {
      s.emit("join:admin");
      setConnected(true);
    };

    const handleUpdate = (payload: any) => {
      setUpdates((prev) => [
        { ...payload, _receivedAt: Date.now() },
        ...prev.slice(0, 19),
      ]);
    };

    if (s.connected) {
      handleConnect();
    } else {
      s.once("connect", handleConnect);
    }

    s.on("admin:joined", () => setConnected(true));
    s.on("admin:order-updated", handleUpdate);

    return () => {
      s.off("connect", handleConnect);
      s.off("admin:joined");
      s.off("admin:order-updated", handleUpdate);
    };
  }, [enabled]);

  return { updates, connected };
}

// Global hook — mounts once, listens for user's order updates
// Uses socket.io if available, plus a polling fallback
export function useGlobalOrderListener(userEmail: string | null) {
  const trackedOrders = useRef<Set<string>>(new Set());
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  useEffect(() => {
    if (!userEmail) return;
    const s = getSocket();
    if (s) {
      const handleStatusChange = (payload: any) => {
        // Only show toast if this update is for the current user
        if (payload.customerEmail !== userEmail) return;

        toast.success(`📦 Order ${payload.orderNumber}`, {
          description: `Status: ${payload.status}${
            payload.trackingNumber
              ? ` · Tracking: ${payload.trackingNumber}`
              : ""
          }`,
        });
      };

      s.on("order:status-changed", handleStatusChange);

      return () => {
        s.off("order:status-changed", handleStatusChange);
      };
    }
  }, [userEmail]);

  // Polling fallback — fetch user's orders every 30s and detect new statuses
  useEffect(() => {
    if (!userEmail) return;

    const poll = async () => {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) return;
        const data = await res.json();
        const orders = data.orders || [];
        if (orders.length === 0) return;

        // On first poll, just record statuses silently
        if (lastChecked === null) {
          const statusMap: Record<string, string> = {};
          orders.forEach((o: any) => {
            statusMap[o.orderNumber] = o.status;
          });
          setLastChecked(JSON.stringify(statusMap));
          return;
        }

        // Compare with previous
        const prev: Record<string, string> = JSON.parse(lastChecked);
        const newStatusMap: Record<string, string> = {};
        let hasChanges = false;

        for (const o of orders) {
          newStatusMap[o.orderNumber] = o.status;
          if (prev[o.orderNumber] && prev[o.orderNumber] !== o.status) {
            hasChanges = true;
            toast.success(`📦 Order ${o.orderNumber}`, {
              description: `Status: ${o.status}${
                o.trackingNumber ? ` · Tracking: ${o.trackingNumber}` : ""
              }`,
            });
          }
        }

        if (hasChanges) {
          setLastChecked(JSON.stringify(newStatusMap));
        }
      } catch (e) {
        // Silent fail
      }
    };

    poll();
    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, [userEmail, lastChecked]);

  return trackedOrders;
}
