"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  ArrowUpRight,
  ArrowLeft,
  Crown,
  Star,
  Truck,
  CheckCircle2,
  Clock,
  Radio,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useStore } from "@/lib/store";
import { useAdminOrderUpdates } from "@/lib/use-realtime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AdminTab = "overview" | "products" | "orders" | "customers";

type Stats = {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  avgOrderValue: number;
};

type RecentOrder = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  customerName: string;
  itemCount: number;
};

type TopProduct = {
  name: string;
  image: string;
  unitsSold: number;
  orderCount: number;
};

type AdminOrder = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  shippingAddress: string;
  trackingNumber: string | null;
  createdAt: string;
  customer: { name: string; email: string; tier: string };
  items: any[];
};

type AdminProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  badge: string | null;
  description: string;
  shortDescription: string;
  materials: { label: string; value: string }[];
  craftsmanship: string;
  care: string;
  origin: string;
  sustainability: string;
  fit: string;
  features: string[];
  inStock: number;
  rating: number;
  reviewCount: number;
};

type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  tier: string;
  loyaltyPoints: number;
  lifetimeSpend: number;
  joinedAt: string;
  avatar: string | null;
  orderCount: number;
  reviewCount: number;
  wishlistCount: number;
};

const ORDER_STATUSES = [
  "Processing",
  "Confirmed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export function AdminView() {
  const { data: session, status } = useSession();
  const { setView } = useStore();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [loading, setLoading] = useState(true);

  // Admin-only: listen to all order updates via socket.io
  const { updates, connected } = useAdminOrderUpdates(true);

  const isAdmin = (session?.user as any)?.isAdmin;

  // Auth gate
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center mb-6">
          <Crown className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="font-serif text-4xl mb-3">Admin Access Required</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          This area is restricted to MAISON ÉLÉGANCE staff. Sign in with an
          admin account to continue.
        </p>
        <Button
          onClick={() => setView("home")}
          className="rounded-none h-12 px-8 text-sm tracking-wide-luxe uppercase"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] tracking-luxe uppercase text-accent mb-3 flex items-center gap-2">
              <Crown className="h-3 w-3" />
              Admin Dashboard
              {connected && (
                <span className="flex items-center gap-1 text-green-600">
                  <Radio className="h-3 w-3 animate-pulse" />
                  Live
                </span>
              )}
            </p>
            <h1 className="font-serif text-4xl lg:text-5xl">Atelier Console</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => setView("home")}
            className="rounded-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Store
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 mb-8 border-b border-border overflow-x-auto no-scrollbar">
        {(
          [
            ["overview", "Overview", LayoutDashboard],
            ["products", "Products", Package],
            ["orders", "Orders", ShoppingCart],
            ["customers", "Customers", Users],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-6 py-3 text-sm tracking-wide-luxe uppercase border-b-2 transition-colors whitespace-nowrap",
              tab === id
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Live updates ticker (if any) */}
      {updates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-accent/10 border border-accent/30 rounded-sm p-3 mb-6 flex items-center gap-3"
        >
          <Radio className="h-4 w-4 text-accent animate-pulse shrink-0" />
          <p className="text-sm">
            <strong className="font-medium">Live:</strong>{" "}
            {updates[0].event} → {updates[0].room || "all"} ·{" "}
            <span className="text-muted-foreground">
              {new Date(updates[0]._receivedAt).toLocaleTimeString()}
            </span>
          </p>
          <span className="ml-auto text-xs text-muted-foreground">
            {updates.length} recent update{updates.length !== 1 ? "s" : ""}
          </span>
        </motion.div>
      )}

      {/* Tab content */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {tab === "overview" && <OverviewTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "customers" && <CustomersTab />}
      </motion.div>
    </div>
  );
}

// ─── OVERVIEW ──────────────────────────────────────────────────────────────

function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<
    { status: string; count: number }[]
  >([]);
  const [revenueByDay, setRevenueByDay] = useState<
    { date: string; label: string; revenue: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
        setTopProducts(data.topProducts);
        setOrdersByStatus(data.ordersByStatus);
        setRevenueByDay(data.revenueByDay);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const maxRevenue = Math.max(...revenueByDay.map((d) => d.revenue), 1);

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
          color="text-green-600"
        />
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={(stats?.totalOrders || 0).toLocaleString()}
          color="text-blue-600"
        />
        <StatCard
          icon={Package}
          label="Products"
          value={(stats?.totalProducts || 0).toLocaleString()}
          color="text-purple-600"
        />
        <StatCard
          icon={Users}
          label="Customers"
          value={(stats?.totalCustomers || 0).toLocaleString()}
          color="text-amber-600"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 border border-border rounded-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-xl">Revenue · Last 7 Days</h3>
            <TrendingUp className="h-5 w-5 text-accent" />
          </div>
          <div className="flex items-end gap-2 h-48">
            {revenueByDay.map((d, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div className="text-xs font-medium">
                  ${d.revenue.toLocaleString()}
                </div>
                <div className="w-full bg-muted rounded-t-sm overflow-hidden flex-1 flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="w-full bg-accent"
                  />
                </div>
                <div className="text-xs text-muted-foreground">{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by status */}
        <div className="border border-border rounded-sm p-6">
          <h3 className="font-serif text-xl mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {ordersByStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(s.status)}
                  <span className="text-sm">{s.status}</span>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {s.count}
                </Badge>
              </div>
            ))}
            {ordersByStatus.length === 0 && (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">Avg Order Value</p>
            <p className="font-serif text-2xl mt-1">
              ${stats?.avgOrderValue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="border border-border rounded-sm p-6">
          <h3 className="font-serif text-xl mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium text-sm">{o.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.customerName} · {o.itemCount} item
                    {o.itemCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">
                    ${o.total.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            )}
          </div>
        </div>

        {/* Top products */}
        <div className="border border-border rounded-sm p-6">
          <h3 className="font-serif text-xl mb-4">Top Products</h3>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-12 h-14 object-cover rounded-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.unitsSold} sold · {p.orderCount} orders
                  </p>
                </div>
                <Badge variant="secondary">#{i + 1}</Badge>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-sm text-muted-foreground">No sales yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCTS ──────────────────────────────────────────────────────────────

function ProductsTab() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => setLoading(true));
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setProducts(data.products || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Product deleted");
      refresh();
    } else {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          {products.length} products in catalog
        </p>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setDialogOpen(true);
          }}
          className="rounded-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Product
        </Button>
      </div>

      <div className="border border-border rounded-sm overflow-hidden">
        <div className="grid grid-cols-[80px_1fr_120px_100px_100px_120px] gap-3 p-3 bg-secondary/30 text-[10px] tracking-wide-luxe uppercase text-muted-foreground">
          <span></span>
          <span>Name</span>
          <span>Category</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Actions</span>
        </div>
        {products.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-[80px_1fr_120px_100px_100px_120px] gap-3 p-3 border-t border-border items-center hover:bg-muted/30 transition-colors"
          >
            <img
              src={p.images[0]}
              alt={p.name}
              className="w-14 h-16 object-cover rounded-sm"
            />
            <div className="min-w-0">
              <p className="font-medium text-sm line-clamp-1">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {p.brand} · {p.sku}
              </p>
            </div>
            <span className="text-sm">{p.category}</span>
            <span className="text-sm font-medium">
              ${p.price.toLocaleString()}
            </span>
            <span
              className={cn(
                "text-sm",
                p.inStock <= 10 ? "text-amber-600 font-medium" : ""
              )}
            >
              {p.inStock}
            </span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setEditingProduct(p);
                  setDialogOpen(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => handleDelete(p.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        onSaved={refresh}
      />
    </div>
  );
}

// ─── ORDERS ────────────────────────────────────────────────────────────────

function OrdersTab() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Initial load + refetch on filter change
  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => setLoading(true));
    fetch(`/api/admin/orders?status=${statusFilter}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setOrders(data.orders || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [statusFilter, refreshKey]);

  // Polling fallback for real-time updates (every 8s) — supplements socket.io
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`/api/admin/orders?status=${statusFilter}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.orders) setOrders(data.orders);
        })
        .catch(() => {});
    }, 8000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success(`Order marked as ${newStatus}`);
      refresh();
    } else {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <p className="text-muted-foreground">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
          {statusFilter !== "all" && ` · ${statusFilter}`}
        </p>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px] rounded-sm">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {orders.map((o) => (
          <div
            key={o.id}
            className="border border-border rounded-sm overflow-hidden"
          >
            <div className="p-4 grid grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center">
              <div>
                <p className="font-medium">{o.orderNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {o.customer.name} · {o.customer.email} ·{" "}
                  <span className="text-accent">{o.customer.tier}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(o.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right hidden lg:block">
                <p className="text-xs text-muted-foreground">Items</p>
                <p className="font-medium">{o.items.length}</p>
              </div>
              <div className="text-right hidden lg:block">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-medium">${o.total.toLocaleString()}</p>
              </div>
              <Badge
                className={cn(
                  "rounded-sm",
                  getStatusBgClass(o.status)
                )}
              >
                {o.status}
              </Badge>
              <div className="flex gap-2">
                <Select
                  value={o.status}
                  onValueChange={(v) => handleStatusChange(o.id, v)}
                >
                  <SelectTrigger className="w-[140px] h-9 rounded-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-sm"
                  onClick={() =>
                    setExpandedOrder(
                      expandedOrder === o.id ? null : o.id
                    )
                  }
                >
                  {expandedOrder === o.id ? "Hide" : "View"}
                </Button>
              </div>
            </div>

            {expandedOrder === o.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="border-t border-border bg-secondary/20 p-4"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] tracking-wide-luxe uppercase text-muted-foreground mb-2">
                      Items
                    </p>
                    <div className="space-y-2">
                      {o.items.map((item: any, i: number) => (
                        <div key={i} className="flex gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-14 object-cover rounded-sm"
                          />
                          <div className="flex-1">
                            <p className="text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.color} · {item.size} · Qty {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-medium">
                            ${(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-[10px] tracking-wide-luxe uppercase text-muted-foreground mb-1">
                        Shipping Address
                      </p>
                      <p>{o.shippingAddress}</p>
                    </div>
                    {o.trackingNumber && (
                      <div>
                        <p className="text-[10px] tracking-wide-luxe uppercase text-muted-foreground mb-1">
                          Tracking Number
                        </p>
                        <p className="font-mono">{o.trackingNumber}</p>
                      </div>
                    )}
                    <div className="pt-2 border-t border-border space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${o.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>${o.shipping.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span>${o.tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-1 border-t border-border">
                        <span>Total</span>
                        <span>${o.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-16 border border-border rounded-sm">
            <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CUSTOMERS ─────────────────────────────────────────────────────────────

function CustomersTab() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((data) => setCustomers(data.customers || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <p className="text-muted-foreground mb-6">
        {customers.length} customer{customers.length !== 1 ? "s" : ""}
      </p>
      <div className="border border-border rounded-sm overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_100px_120px_100px_100px] gap-3 p-3 bg-secondary/30 text-[10px] tracking-wide-luxe uppercase text-muted-foreground">
          <span>Customer</span>
          <span>Email</span>
          <span>Tier</span>
          <span>Lifetime Spend</span>
          <span>Orders</span>
          <span>Points</span>
        </div>
        {customers.map((c) => (
          <div
            key={c.id}
            className="grid grid-cols-[1fr_1fr_100px_120px_100px_100px] gap-3 p-3 border-t border-border items-center hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              {c.avatar ? (
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
              )}
              <div>
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(c.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span className="text-sm truncate">{c.email}</span>
            <Badge className={cn("rounded-sm", getTierClass(c.tier))}>
              {c.tier}
            </Badge>
            <span className="font-medium">
              ${c.lifetimeSpend.toLocaleString()}
            </span>
            <span className="text-sm">{c.orderCount}</span>
            <span className="text-sm">{c.loyaltyPoints.toLocaleString()}</span>
          </div>
        ))}
        {customers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No customers yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DIALOGS / HELPERS ─────────────────────────────────────────────────────

function ProductDialog({
  open,
  onOpenChange,
  product,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: AdminProduct | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (product) {
        setForm({
          name: product.name,
          brand: product.brand,
          category: product.category,
          subcategory: product.subcategory,
          price: product.price,
          compareAtPrice: product.compareAtPrice || "",
          images: product.images.join("\n"),
          shortDescription: product.shortDescription,
          description: product.description,
          fit: product.fit,
          origin: product.origin,
          care: product.care,
          craftsmanship: product.craftsmanship,
          sustainability: product.sustainability,
          inStock: product.inStock,
          badge: product.badge || "",
          sizes: product.sizes.join(","),
          features: product.features.join("\n"),
        });
      } else {
        setForm({
          name: "",
          brand: "MAISON ÉLÉGANCE",
          category: "Women",
          subcategory: "",
          price: "",
          compareAtPrice: "",
          images: "",
          shortDescription: "",
          description: "",
          fit: "",
          origin: "",
          care: "",
          craftsmanship: "",
          sustainability: "",
          inStock: "0",
          badge: "",
          sizes: "XS,S,M,L,XL",
          features: "",
        });
      }
    }
  }, [open, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseInt(form.price) || 0,
        compareAtPrice: form.compareAtPrice
          ? parseInt(form.compareAtPrice)
          : null,
        inStock: parseInt(form.inStock) || 0,
        images: form.images
          .split("\n")
          .map((s: string) => s.trim())
          .filter(Boolean),
        sizes: form.sizes
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean),
        features: form.features
          .split("\n")
          .map((s: string) => s.trim())
          .filter(Boolean),
        colors: [{ name: "Default", hex: "#000000" }],
        materials: [],
      };

      const url = product
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";
      const method = product ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      toast.success(product ? "Product updated" : "Product created");
      onOpenChange(false);
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Create New Product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Name *</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Brand</Label>
              <Input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger className="rounded-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Women", "Men", "Outerwear", "Footwear", "Accessories"].map(
                    (c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Subcategory</Label>
              <Input
                value={form.subcategory}
                onChange={(e) =>
                  setForm({ ...form, subcategory: e.target.value })
                }
                className="rounded-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Price (USD) *</Label>
              <Input
                required
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">
                Compare-at Price (optional)
              </Label>
              <Input
                type="number"
                value={form.compareAtPrice}
                onChange={(e) =>
                  setForm({ ...form, compareAtPrice: e.target.value })
                }
                className="rounded-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Stock</Label>
              <Input
                type="number"
                value={form.inStock}
                onChange={(e) => setForm({ ...form, inStock: e.target.value })}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Badge</Label>
              <Select
                value={form.badge || "none"}
                onValueChange={(v) =>
                  setForm({ ...form, badge: v === "none" ? "" : v })
                }
              >
                <SelectTrigger className="rounded-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No badge</SelectItem>
                  {["New", "Bestseller", "Limited", "Sustainable"].map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">
              Image URLs (one per line)
            </Label>
            <Textarea
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
              placeholder="https://images.unsplash.com/photo-..."
              className="rounded-sm font-mono text-xs min-h-[80px]"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Sizes (comma-separated)</Label>
              <Input
                value={form.sizes}
                onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Short Description</Label>
              <Input
                value={form.shortDescription}
                onChange={(e) =>
                  setForm({ ...form, shortDescription: e.target.value })
                }
                className="rounded-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="rounded-sm min-h-[80px]"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Fit</Label>
              <Input
                value={form.fit}
                onChange={(e) => setForm({ ...form, fit: e.target.value })}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Origin</Label>
              <Input
                value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
                className="rounded-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">
              Features (one per line)
            </Label>
            <Textarea
              value={form.features}
              onChange={(e) =>
                setForm({ ...form, features: e.target.value })
              }
              className="rounded-sm min-h-[80px]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="rounded-sm flex-1"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>{product ? "Save Changes" : "Create Product"}</>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-sm"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="border border-border rounded-sm p-5 bg-background">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] tracking-wide-luxe uppercase text-muted-foreground">
          {label}
        </p>
        <Icon className={cn("h-4 w-4", color || "text-accent")} />
      </div>
      <p className="font-serif text-3xl">{value}</p>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-accent" />
    </div>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case "Delivered":
      return <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />;
    case "Shipped":
      return <Truck className="h-3.5 w-3.5 text-blue-600" />;
    case "Processing":
    case "Confirmed":
      return <Clock className="h-3.5 w-3.5 text-purple-600" />;
    default:
      return <Package className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

function getStatusBgClass(status: string) {
  switch (status) {
    case "Delivered":
      return "bg-green-100 text-green-800";
    case "Shipped":
      return "bg-blue-100 text-blue-800";
    case "Out for Delivery":
      return "bg-amber-100 text-amber-800";
    case "Confirmed":
    case "Processing":
      return "bg-purple-100 text-purple-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getTierClass(tier: string) {
  switch (tier) {
    case "Platinum":
      return "bg-purple-100 text-purple-800";
    case "Gold":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
