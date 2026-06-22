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
  FolderTree,
  ChevronRight,
  ChevronDown,
  Folder,
  Palette,
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
import { ImageUploader } from "./ImageUploader";
import { isClientAdminEmail } from "@/lib/client-admin";

type AdminTab = "overview" | "products" | "orders" | "customers" | "categories" | "themestudio";

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

  const isAdmin = (session?.user as any)?.isAdmin || isClientAdminEmail(session?.user?.email);

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
            ["categories", "Categories", FolderTree],
            ["themestudio", "Theme Studio", Palette],
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
        {tab === "categories" && <CategoriesTab />}
        {tab === "themestudio" && <ThemeStudioTab />}
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
  const [fullData, setFullData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Stats API failed");
        return r.json();
      })
      .then((data) => {
        setFullData(data);
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setTopProducts(data.topProducts || []);
        setOrdersByStatus(data.ordersByStatus || []);
        setRevenueByDay(data.revenueByDay || []);
      })
      .catch(() => {
        // API failed — set empty defaults so the page doesn't crash
        setStats({ totalProducts: 0, totalOrders: 0, totalCustomers: 0, totalRevenue: 0, avgOrderValue: 0 });
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

      {/* Advanced Analytics */}
      <div className="space-y-6">
        {/* 30-day revenue trend */}
        <div className="border border-border rounded-sm p-6">
          <h3 className="font-serif text-xl mb-4">Revenue · Last 30 Days</h3>
          {fullData && (fullData as any).revenueByDay30 && (
            <div className="flex items-end gap-px h-32 overflow-x-auto">
              {fullData && (fullData as any).revenueByDay30.map((d: any, i: number) => {
                const max = Math.max(...(fullData as any).revenueByDay30.map((x: any) => x.revenue), 1);
                return (
                  <div key={i} className="flex-1 min-w-[8px] flex flex-col items-center group relative">
                    <div className="w-full bg-accent/30 hover:bg-accent transition-colors rounded-t-sm" style={{ height: `${(d.revenue / max) * 100}%` }} />
                    {d.revenue > 0 && (
                      <div className="absolute -top-6 opacity-0 group-hover:opacity-100 bg-background border border-border rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap z-10">
                        ${d.revenue}
                      </div>
                    )}
                    {i % 5 === 0 && (
                      <span className="text-[8px] text-muted-foreground mt-1 rotate-45">{d.label}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Conversion funnel */}
          <div className="border border-border rounded-sm p-6">
            <h3 className="font-serif text-xl mb-4">Conversion Funnel</h3>
            {fullData && (fullData as any).funnel && (() => {
              const f = (fullData as any).funnel;
              const stages = [
                { label: "Visitors", value: f.visitors, color: "bg-blue-400" },
                { label: "Product Views", value: f.productViews, color: "bg-indigo-400" },
                { label: "Cart Adds", value: f.cartAdds, color: "bg-purple-400" },
                { label: "Checkouts", value: f.checkouts, color: "bg-amber-400" },
                { label: "Purchases", value: f.purchases, color: "bg-green-500" },
              ];
              const max = stages[0].value;
              return (
                <div className="space-y-3">
                  {stages.map((s, i) => {
                    const pct = (s.value / max) * 100;
                    const convRate = i > 0 ? ((s.value / stages[i - 1].value) * 100).toFixed(1) : "100";
                    return (
                      <div key={s.label}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium">{s.label}</span>
                          <span className="text-muted-foreground">
                            {s.value} ({convRate}%)
                          </span>
                        </div>
                        <div className="h-7 bg-muted rounded-sm overflow-hidden">
                          <div className={cn("h-full rounded-sm transition-all", s.color)} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Sales by category */}
          <div className="border border-border rounded-sm p-6">
            <h3 className="font-serif text-xl mb-4">Revenue by Category</h3>
            {fullData && (fullData as any).categoryRevenue && (fullData as any).categoryRevenue.length > 0 ? (
              <div className="space-y-3">
                {fullData && (fullData as any).categoryRevenue.map((c: any) => {
                  const max = Math.max(...(fullData as any).categoryRevenue.map((x: any) => x.revenue), 1);
                  return (
                    <div key={c.category}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium">{c.category}</span>
                        <span className="text-muted-foreground">${c.revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-5 bg-muted rounded-sm overflow-hidden">
                        <div className="h-full bg-accent rounded-sm" style={{ width: `${(c.revenue / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No sales data yet.</p>
            )}
          </div>
        </div>

        {/* AOV trend + customer cohorts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="border border-border rounded-sm p-6">
            <h3 className="font-serif text-xl mb-4">Avg Order Value · 7 Days</h3>
            {fullData && (fullData as any).aovByDay && (
              <div className="flex items-end gap-2 h-24">
                {fullData && (fullData as any).aovByDay.map((d: any, i: number) => {
                  const max = Math.max(...(fullData as any).aovByDay.map((x: any) => x.aov), 1);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-medium">${d.aov}</span>
                      <div className="w-full bg-muted rounded-t-sm overflow-hidden flex-1 flex items-end">
                        <div className="w-full bg-accent/60 rounded-t-sm" style={{ height: `${(d.aov / max) * 100}%` }} />
                      </div>
                      <span className="text-[9px] text-muted-foreground">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border border-border rounded-sm p-6">
            <h3 className="font-serif text-xl mb-4">Customer Cohorts</h3>
            {fullData && (fullData as any).cohorts && (fullData as any).cohorts.length > 0 ? (
              <div className="space-y-2">
                {fullData && (fullData as any).cohorts.map((c: any) => (
                  <div key={c.month} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{c.month}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${(c.count / Math.max(...(fullData as any).cohorts.map((x: any) => x.count), 1)) * 100}%` }} />
                      </div>
                      <span className="font-medium text-xs w-6 text-right">{c.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No customers yet.</p>
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
  const [structuredCats, setStructuredCats] = useState<
    { id: string; name: string; path: string; slug: string }[]
  >([]);

  // Fetch structured categories for the picker
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => {
        const flat: any[] = [];
        const walk = (cats: any[], prefix: string) => {
          for (const c of cats || []) {
            flat.push({
              id: c.id,
              name: c.name,
              path: prefix + c.name,
              slug: c.slug,
            });
            walk(c.children || [], prefix + c.name + " › ");
          }
        };
        walk(data.tree || [], "");
        setStructuredCats(flat);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (open) {
      if (product) {
        setForm({
          name: product.name,
          brand: product.brand,
          category: product.category,
          subcategory: product.subcategory,
          categoryId: (product as any).categoryId || "",
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
          categoryId: "",
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
            <div className="sm:col-span-2">
              <Label className="text-xs mb-1.5 block">
                Structured Category (new — appears in mega menu)
              </Label>
              <Select
                value={form.categoryId || "none"}
                onValueChange={(v) =>
                  setForm({ ...form, categoryId: v === "none" ? "" : v })
                }
              >
                <SelectTrigger className="rounded-sm">
                  <SelectValue placeholder="— None (use flat category above) —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    — None (use flat category above) —
                  </SelectItem>
                  {structuredCats.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.path}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Label className="text-xs mb-1.5 block">Product Images</Label>
            <ImageUploader
              images={form.images ? form.images.split("\n").filter(Boolean) : []}
              onChange={(imgs) => setForm({ ...form, images: imgs.join("\n") })}
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

// ─── CATEGORIES (multi-level hierarchy management) ─────────────────────────

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  icon: string | null;
  image: string | null;
  description: string | null;
  order: number;
  isActive: boolean;
  children: Category[];
};

function CategoriesTab() {
  const [tree, setTree] = useState<Category[]>([]);
  const [flatCats, setFlatCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => setLoading(true));
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setTree(data.tree || []);
          setFlatCats(data.categories || []);
          // Auto-expand top-level
          setExpanded(new Set((data.tree || []).map((c: Category) => c.id)));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (cat: Category) => {
    if (cat.children.length > 0) {
      toast.error(
        `Cannot delete "${cat.name}" — has ${cat.children.length} subcategories. Delete or move them first.`
      );
      return;
    }
    if (!confirm(`Delete category "${cat.name}"? Products in this category will be uncategorized.`)) return;
    const res = await fetch(`/api/admin/categories/${cat.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Category deleted");
      refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to delete");
    }
  };

  const toggleActive = async (cat: Category) => {
    const res = await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !cat.isActive }),
    });
    if (res.ok) {
      toast.success(`${cat.name} ${cat.isActive ? "hidden" : "activated"}`);
      refresh();
    }
  };

  if (loading) return <Loading />;

  const renderCategory = (cat: Category, depth = 0) => (
    <div key={cat.id}>
      <div
        className={cn(
          "flex items-center gap-3 py-3 px-3 hover:bg-muted/30 transition-colors border-b border-border",
          !cat.isActive && "opacity-50"
        )}
        style={{ paddingLeft: `${12 + depth * 24}px` }}
      >
        {cat.children.length > 0 ? (
          <button
            onClick={() => toggleExpand(cat.id)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted shrink-0"
            aria-label={expanded.has(cat.id) ? "Collapse" : "Expand"}
          >
            {expanded.has(cat.id) ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <Folder className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        )}

        {cat.image && (
          <img
            src={cat.image}
            alt={cat.name}
            className="w-8 h-8 object-cover rounded shrink-0"
          />
        )}

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{cat.name}</p>
          <p className="text-xs text-muted-foreground font-mono">/{cat.slug}</p>
        </div>

        {cat.description && (
          <p className="text-xs text-muted-foreground hidden lg:block max-w-xs truncate">
            {cat.description}
          </p>
        )}

        <Badge
          variant="secondary"
          className="rounded-sm text-xs shrink-0"
        >
          {cat.children.length} sub{cat.children.length !== 1 ? "s" : ""}
        </Badge>

        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs shrink-0"
          onClick={() => toggleActive(cat)}
        >
          {cat.isActive ? "Hide" : "Show"}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 shrink-0"
          onClick={() => {
            setEditingCat(cat);
            setDialogOpen(true);
          }}
          aria-label="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 shrink-0 text-destructive hover:text-destructive"
          onClick={() => handleDelete(cat)}
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      {cat.children.length > 0 && expanded.has(cat.id) && (
        <div>
          {cat.children
            .sort((a, b) => a.order - b.order)
            .map((child) => renderCategory(child, depth + 1))}
        </div>
      )}
    </div>
  );

  const totalCats = flatCats.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <p className="text-muted-foreground">
          {totalCats} categor{totalCats !== 1 ? "ies" : "y"} ·{" "}
          {tree.length} top-level
        </p>
        <Button
          onClick={() => {
            setEditingCat(null);
            setDialogOpen(true);
          }}
          className="rounded-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Category
        </Button>
      </div>

      <div className="border border-border rounded-sm overflow-hidden">
        <div className="bg-secondary/30 px-3 py-2 text-[10px] tracking-wide-luxe uppercase text-muted-foreground border-b border-border">
          Category Tree (click ▸ to expand)
        </div>
        {tree.length === 0 ? (
          <div className="text-center py-12">
            <FolderTree className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No categories yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first category to organize products.
            </p>
          </div>
        ) : (
          tree
            .sort((a, b) => a.order - b.order)
            .map((cat) => renderCategory(cat))
        )}
      </div>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCat}
        allCategories={flatCats}
        onSaved={refresh}
      />
    </div>
  );
}

function CategoryDialog({
  open,
  onOpenChange,
  category,
  allCategories,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category: Category | null;
  allCategories: Category[];
  onSaved: () => void;
}) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (category) {
        setForm({
          name: category.name,
          slug: category.slug,
          parentId: category.parentId || "",
          icon: category.icon || "",
          image: category.image || "",
          description: category.description || "",
          isActive: category.isActive,
        });
      } else {
        setForm({
          name: "",
          slug: "",
          parentId: "",
          icon: "",
          image: "",
          description: "",
          isActive: true,
        });
      }
    }
  }, [open, category]);

  // Build parent options — exclude self and descendants to prevent cycles
  const getDescendantIds = (id: string): string[] => {
    const direct = allCategories.filter((c) => c.parentId === id);
    return [id, ...direct.flatMap((c) => getDescendantIds(c.id))];
  };
  const excludedIds = category ? new Set(getDescendantIds(category.id)) : new Set();
  const parentOptions = allCategories.filter((c) => !excludedIds.has(c.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        parentId: form.parentId || null,
        icon: form.icon || null,
        image: form.image || null,
      };
      const url = category
        ? `/api/admin/categories/${category.id}`
        : "/api/admin/categories";
      const method = category ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      toast.success(category ? "Category updated" : "Category created");
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Create New Category"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Name *</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => {
                  const newSlug =
                    !category
                      ? e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, "")
                      : form.slug;
                  setForm({ ...form, name: e.target.value, slug: newSlug });
                }}
                className="rounded-sm"
                placeholder="e.g. T-Shirts"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Slug (URL)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="rounded-sm font-mono text-xs"
                placeholder="auto-generated"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">Parent Category</Label>
            <Select
              value={form.parentId || "none"}
              onValueChange={(v) =>
                setForm({ ...form, parentId: v === "none" ? "" : v })
              }
            >
              <SelectTrigger className="rounded-sm">
                <SelectValue placeholder="Top-level (no parent)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Top-level (no parent) —</SelectItem>
                {parentOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} <span className="text-muted-foreground">/{c.slug}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground mt-1">
              Selecting a parent makes this a subcategory (e.g. T-Shirts under Men › Tops)
            </p>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">Image URL (optional)</Label>
            <Input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="rounded-sm"
              placeholder="https://..."
            />
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">Description (optional)</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="rounded-sm"
              placeholder="Brief description for SEO + nav"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.checked })
              }
              className="rounded"
            />
            <span className="text-sm">Active (visible on storefront)</span>
          </label>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="rounded-sm flex-1"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>{category ? "Save Changes" : "Create Category"}</>
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

// ─── THEME STUDIO (design customization) ───────────────────────────────────

type ThemePreset = {
  id: string;
  name: string;
  isActive: boolean;
  settings: any;
};

function ThemeStudioTab() {
  const [themes, setThemes] = useState<ThemePreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ThemePreset | null>(null);
  const [draft, setDraft] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => setLoading(true));
    fetch("/api/admin/themes")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setThemes(data.themes || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  const activateTheme = async (id: string) => {
    const res = await fetch(`/api/admin/themes/${id}/activate`, { method: "POST" });
    if (res.ok) {
      toast.success("Theme activated — live on your store!");
      refresh();
      // Apply locally for instant preview
      const theme = themes.find((t) => t.id === id);
      if (theme) {
        const root = document.documentElement;
        Object.entries(theme.settings).forEach(([key, val]) => {
          const cssKey = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
          root.style.setProperty(cssKey, val as string);
        });
      }
    }
  };

  const handleEdit = (theme: ThemePreset) => {
    setEditing(theme);
    setDraft({ ...theme.settings });
    // Apply for live preview
    applyDraftPreview({ ...theme.settings });
  };

  const applyDraftPreview = (settings: any) => {
    const root = document.documentElement;
    Object.entries(settings).forEach(([key, val]) => {
      const cssKey = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
      root.style.setProperty(cssKey, val as string);
    });
  };

  const updateDraft = (key: string, value: string) => {
    const newDraft = { ...draft, [key]: value };
    setDraft(newDraft);
    applyDraftPreview(newDraft);
  };

  const saveDraft = async () => {
    if (!editing) return;
    const res = await fetch(`/api/admin/themes/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: draft }),
    });
    if (res.ok) {
      toast.success("Theme saved");
      setEditing(null);
      setDraft(null);
      refresh();
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft(null);
    // Re-apply the active theme
    const active = themes.find((t) => t.isActive);
    if (active) applyDraftPreview(active.settings);
  };

  const createFromPreset = async (name: string, settings: any) => {
    const uniqueName = `${name} Copy`;
    const res = await fetch("/api/admin/themes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: uniqueName, settings }),
    });
    if (res.ok) {
      toast.success(`"${uniqueName}" created — customize away!`);
      refresh();
    }
  };

  const deleteTheme = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await fetch(`/api/admin/themes/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Theme deleted");
      refresh();
    }
  };

  if (loading) return <Loading />;

  const colorFields: { key: string; label: string }[] = [
    { key: "primary", label: "Primary (buttons, text on light)" },
    { key: "primaryForeground", label: "Primary Text (on primary bg)" },
    { key: "accent", label: "Accent (gold highlights, links)" },
    { key: "accentForeground", label: "Accent Text" },
    { key: "background", label: "Background" },
    { key: "foreground", label: "Body Text" },
    { key: "muted", label: "Muted Background (cards, pills)" },
    { key: "mutedForeground", label: "Muted Text" },
    { key: "border", label: "Borders" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl mb-2">Theme Studio</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Change your store's complete look — colors, fonts, corners. Pick a preset to start,
          then customize every detail. Changes go live instantly when you activate a theme.
        </p>
      </div>

      {/* Preset themes grid */}
      <div>
        <h3 className="font-serif text-lg mb-4">Preset Themes</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={cn(
                "border-2 rounded-sm overflow-hidden transition-all cursor-pointer",
                theme.isActive ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-accent/50"
              )}
              onClick={() => activateTheme(theme.id)}
            >
              {/* Color preview swatches */}
              <div className="h-20 flex" style={{ background: theme.settings.background }}>
                <div className="flex-1" style={{ background: theme.settings.primary }} />
                <div className="flex-1" style={{ background: theme.settings.accent }} />
                <div className="flex-1" style={{ background: theme.settings.muted }} />
                <div className="flex-1" style={{ background: theme.settings.border }} />
              </div>
              <div className="p-3" style={{ background: theme.settings.background, color: theme.settings.foreground }}>
                <div className="flex items-center justify-between">
                  <p className="font-serif text-sm">{theme.name}</p>
                  {theme.isActive && (
                    <span className="text-[9px] tracking-wide-luxe uppercase text-accent font-medium">● Live</span>
                  )}
                </div>
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(theme); }}
                    className="text-[10px] px-2 py-1 rounded-sm border border-border hover:bg-muted transition-colors"
                  >
                    Customize
                  </button>
                  {!theme.isActive && (
                    <button
                      onClick={(e) => { e.stopPropagation(); activateTheme(theme.id); }}
                      className="text-[10px] px-2 py-1 rounded-sm bg-accent text-accent-foreground hover:opacity-90"
                    >
                      Activate
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteTheme(theme.id, theme.name); }}
                    className="text-[10px] px-2 py-1 rounded-sm text-destructive hover:bg-destructive/10 ml-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create from preset */}
      <div>
        <h3 className="font-serif text-lg mb-4">Create New from Preset</h3>
        <div className="flex flex-wrap gap-2">
          {PRESET_THEMES_LIST.map((preset) => (
            <button
              key={preset.name}
              onClick={() => createFromPreset(preset.name, preset.settings)}
              className="text-sm px-4 py-2 border border-border rounded-sm hover:border-accent hover:text-accent transition-colors"
            >
              + {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Customization panel */}
      {editing && draft && (
        <div className="border-2 border-accent/30 rounded-sm p-6 bg-secondary/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-lg">Customizing: {editing.name}</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={cancelEdit} className="rounded-sm">Cancel</Button>
              <Button size="sm" onClick={saveDraft} className="rounded-sm">Save Changes</Button>
            </div>
          </div>

          {/* Color pickers */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {colorFields.map((field) => (
              <div key={field.key}>
                <Label className="text-xs mb-1.5 block">{field.label}</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={draft[field.key]}
                    onChange={(e) => updateDraft(field.key, e.target.value)}
                    className="w-10 h-10 rounded-sm border border-border cursor-pointer shrink-0"
                  />
                  <Input
                    value={draft[field.key]}
                    onChange={(e) => updateDraft(field.key, e.target.value)}
                    className="rounded-sm font-mono text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Radius */}
          <div className="mb-6">
            <Label className="text-xs mb-1.5 block">Border Radius (corners)</Label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="20"
                value={parseInt(draft.radius) || 0}
                onChange={(e) => updateDraft("radius", `${e.target.value}px`)}
                className="flex-1 accent-accent"
              />
              <span className="font-mono text-sm w-16">{draft.radius}</span>
            </div>
          </div>

          {/* Fonts */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div>
              <Label className="text-xs mb-1.5 block">Heading Font (Serif)</Label>
              <select
                value={draft.fontSerif}
                onChange={(e) => updateDraft("fontSerif", e.target.value)}
                className="w-full h-10 px-3 rounded-sm border border-input bg-background text-sm"
              >
                <option value="Playfair Display, Georgia, serif">Playfair Display (elegant)</option>
                <option value="Georgia, serif">Georgia (classic)</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Inter, system-ui, sans-serif">Inter (modern sans)</option>
                <option value="'Courier New', monospace">Courier (mono)</option>
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Body Font (Sans)</Label>
              <select
                value={draft.fontSans}
                onChange={(e) => updateDraft("fontSans", e.target.value)}
                className="w-full h-10 px-3 rounded-sm border border-input bg-background text-sm"
              >
                <option value="Inter, system-ui, sans-serif">Inter (clean)</option>
                <option value="system-ui, -apple-system, sans-serif">System Default</option>
                <option value="'Helvetica Neue', Arial, sans-serif">Helvetica</option>
                <option value="Georgia, serif">Georgia (serif body)</option>
              </select>
            </div>
          </div>

          {/* Live preview note */}
          <div className="bg-accent/10 border border-accent/20 rounded-sm p-3 text-xs">
            ✨ <strong>Live Preview:</strong> Changes are applied instantly to this page.
            Click "Save Changes" to persist, or "Cancel" to revert.
          </div>
        </div>
      )}
    </div>
  );
}

const PRESET_THEMES_LIST = [
  { name: "Ivory Classic", settings: { primary: "#2c2418", primaryForeground: "#fbf7ed", accent: "#c19a45", accentForeground: "#2c2418", background: "#fbf7ed", foreground: "#2c2418", muted: "#f0ebe0", mutedForeground: "#75695a", border: "#e5dfd3", radius: "0.5rem", fontSerif: "Playfair Display, Georgia, serif", fontSans: "Inter, system-ui, sans-serif" } },
  { name: "Midnight Noir", settings: { primary: "#0d0d0d", primaryForeground: "#f5f5f0", accent: "#c19a45", accentForeground: "#0d0d0d", background: "#121212", foreground: "#f5f5f0", muted: "#1e1e1e", mutedForeground: "#999999", border: "#2a2a2a", radius: "0.25rem", fontSerif: "Playfair Display, Georgia, serif", fontSans: "Inter, system-ui, sans-serif" } },
  { name: "Rose Gold", settings: { primary: "#4a2c2a", primaryForeground: "#fdf5f0", accent: "#d4a5a5", accentForeground: "#4a2c2a", background: "#fdf5f0", foreground: "#4a2c2a", muted: "#f5e6e0", mutedForeground: "#8a6b65", border: "#e8d0c8", radius: "0.75rem", fontSerif: "Playfair Display, Georgia, serif", fontSans: "Inter, system-ui, sans-serif" } },
  { name: "Forest Sage", settings: { primary: "#1a2e1f", primaryForeground: "#f0f5ed", accent: "#7a9b6e", accentForeground: "#1a2e1f", background: "#f0f5ed", foreground: "#1a2e1f", muted: "#dfe8d8", mutedForeground: "#5a6b50", border: "#c5d4bc", radius: "0.5rem", fontSerif: "Playfair Display, Georgia, serif", fontSans: "Inter, system-ui, sans-serif" } },
  { name: "Ocean Blue", settings: { primary: "#0f2a3f", primaryForeground: "#eef4f8", accent: "#5b9bd5", accentForeground: "#0f2a3f", background: "#eef4f8", foreground: "#0f2a3f", muted: "#d8e5ee", mutedForeground: "#4a6578", border: "#bcd0de", radius: "0.5rem", fontSerif: "Playfair Display, Georgia, serif", fontSans: "Inter, system-ui, sans-serif" } },
  { name: "Royal Purple", settings: { primary: "#2d1b3d", primaryForeground: "#f5f0f8", accent: "#9b6dbf", accentForeground: "#2d1b3d", background: "#f5f0f8", foreground: "#2d1b3d", muted: "#e8d8f0", mutedForeground: "#6b5a78", border: "#d0bcd8", radius: "0.5rem", fontSerif: "Playfair Display, Georgia, serif", fontSans: "Inter, system-ui, sans-serif" } },
  { name: "Warm Terracotta", settings: { primary: "#3d2817", primaryForeground: "#faf3e8", accent: "#d4744a", accentForeground: "#faf3e8", background: "#faf3e8", foreground: "#3d2817", muted: "#f0e4d0", mutedForeground: "#8a6b50", border: "#e0d0b8", radius: "0.375rem", fontSerif: "Playfair Display, Georgia, serif", fontSans: "Inter, system-ui, sans-serif" } },
  { name: "Sleek Minimal", settings: { primary: "#111111", primaryForeground: "#ffffff", accent: "#111111", accentForeground: "#ffffff", background: "#ffffff", foreground: "#111111", muted: "#f5f5f5", mutedForeground: "#888888", border: "#e5e5e5", radius: "0px", fontSerif: "Inter, system-ui, sans-serif", fontSans: "Inter, system-ui, sans-serif" } },
];
