"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Package,
  MapPin,
  CreditCard,
  Heart,
  Award,
  Bell,
  Settings,
  Eye,
  LogOut,
  ChevronRight,
  Plus,
  Trash2,
  Star,
  ShoppingBag,
  TrendingUp,
  Gift,
  Check,
  Pencil,
  Mail,
  Phone,
  Calendar,
  Edit3,
  Truck,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useUserData } from "@/lib/use-user-data";
import { getProductById } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import type { ProfileTab, Address, PaymentMethod } from "@/lib/store";
import { AuthModal } from "./AuthModal";

const tabs: { id: ProfileTab; label: string; icon: any }[] = [
  { id: "overview", label: "Overview", icon: User },
  { id: "orders", label: "Orders", icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "loyalty", label: "Loyalty", icon: Award },
  { id: "recently-viewed", label: "Recently Viewed", icon: Eye },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

export function ProfileView() {
  const store = useStore();
  const {
    paymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPayment,
    notificationPrefs,
    updateNotificationPrefs,
    lastViewedProductIds,
    openProduct,
    setView,
    setProfileTab,
    profileTab,
  } = store;

  // Real auth + data fetching
  const {
    session,
    status,
    isAuthenticated,
    user,
    addresses,
    orders,
    wishlist,
    wishlistProductIds,
    loading,
    addAddress,
    updateAddress,
    deleteAddress,
    toggleWishlist,
    updateProfile,
  } = useUserData();

  const [authOpen, setAuthOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    avatar: "",
  });
  const [addrDialogOpen, setAddrDialogOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);
  const [pmDialogOpen, setPmDialogOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Sync profileForm when user data arrives
  useState(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        dob: user.dob || "",
        gender: user.gender || "",
        avatar: user.image || user.avatar || "",
      });
    }
  });

  // Show sign-in CTA for unauthenticated users
  if (status !== "loading" && !isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center mb-6">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-4xl mb-3">Sign in to your account</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Access your orders, addresses, wishlist, and exclusive member
            benefits. New members earn 100 bonus points.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={() => setAuthOpen(true)}
              className="rounded-none h-12 px-8 text-sm tracking-wide-luxe uppercase"
            >
              Sign In
            </Button>
            <Button
              onClick={() => {
                store.setProfileTab("overview" as any);
                setAuthOpen(true);
              }}
              variant="outline"
              className="rounded-none h-12 px-8 text-sm tracking-wide-luxe uppercase"
            >
              Create Account
            </Button>
          </div>
          <AuthModal
            open={authOpen}
            onClose={() => setAuthOpen(false)}
            initialMode="signin"
          />
        </motion.div>
      </div>
    );
  }

  // Loading state
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // Build profile object from session user
  const profile = {
    name: user?.name || "Member",
    email: user?.email || "",
    phone: user?.phone || "",
    dob: user?.dob || "",
    gender: user?.gender || "",
    avatar: user?.image || user?.avatar || "",
    memberSince: user?.memberSince || "Recently",
    tier: user?.tier || "Silver",
    loyaltyPoints: user?.loyaltyPoints || 0,
    lifetimeSpend: user?.lifetimeSpend || 0,
  };

  const saveProfile = () => {
    updateProfile(profileForm);
    setEditingProfile(false);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    toast.success("Signed out");
    setTimeout(() => window.location.reload(), 300);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Shipped":
        return "bg-blue-100 text-blue-800";
      case "Out for Delivery":
        return "bg-amber-100 text-amber-800";
      case "Confirmed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
          My Account
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl">Welcome, {profile.name.split(" ")[0]}</h1>
      </motion.div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground p-6 lg:p-8 rounded-sm mb-8 lg:mb-10"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-accent"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-serif text-2xl">{profile.name}</h2>
              <span className="text-[10px] tracking-luxe uppercase bg-accent text-accent-foreground px-3 py-1">
                {profile.tier} Member
              </span>
            </div>
            <p className="text-primary-foreground/70 text-sm mt-1">
              {profile.email} · Member since {profile.memberSince}
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none bg-primary-foreground/10 backdrop-blur px-5 py-3 rounded-sm text-center min-w-[100px]">
              <p className="text-[10px] tracking-wide-luxe uppercase text-primary-foreground/60">
                Points
              </p>
              <p className="font-serif text-xl text-accent mt-0.5">
                {profile.loyaltyPoints.toLocaleString()}
              </p>
            </div>
            <div className="flex-1 sm:flex-none bg-primary-foreground/10 backdrop-blur px-5 py-3 rounded-sm text-center min-w-[100px]">
              <p className="text-[10px] tracking-wide-luxe uppercase text-primary-foreground/60">
                Lifetime
              </p>
              <p className="font-serif text-xl text-accent mt-0.5">
                ${(profile.lifetimeSpend / 1000).toFixed(1)}k
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-32 h-fit">
          {/* Mobile dropdown */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setMobileNavOpen((s) => !s)}
              className="w-full flex items-center justify-between p-4 border border-border rounded-sm"
            >
              <span className="font-medium flex items-center gap-2">
                {tabs.find((t) => t.id === profileTab)?.icon && (
                  (() => {
                    const Tab = tabs.find((t) => t.id === profileTab)!;
                    return <Tab.icon className="h-4 w-4" />;
                  })()
                )}
                {tabs.find((t) => t.id === profileTab)?.label}
              </span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform",
                  mobileNavOpen && "rotate-90"
                )}
              />
            </button>
            {mobileNavOpen && (
              <nav className="mt-2 border border-border rounded-sm overflow-hidden">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setProfileTab(t.id);
                      setMobileNavOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors",
                      profileTab === t.id
                        ? "bg-accent/10 text-accent"
                        : "hover:bg-muted"
                    )}
                  >
                    <t.icon className="h-4 w-4" />
                    {t.label}
                  </button>
                ))}
              </nav>
            )}
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:block border-t border-border">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setProfileTab(t.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 text-sm border-b border-border transition-colors text-left",
                  profileTab === t.id
                    ? "bg-accent/10 text-accent font-medium border-l-2 border-l-accent"
                    : "hover:bg-muted/50"
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm border-b border-border transition-colors text-left hover:bg-muted/50 text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="min-h-[500px]">
          {/* OVERVIEW */}
          {profileTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl">Personal Information</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setProfileForm({
                      name: profile.name,
                      email: profile.email,
                      phone: profile.phone,
                      dob: profile.dob,
                      gender: profile.gender,
                      avatar: profile.avatar,
                    });
                    setEditingProfile(!editingProfile);
                  }}
                  className="rounded-sm"
                >
                  <Edit3 className="h-3.5 w-3.5 mr-2" />
                  {editingProfile ? "Cancel" : "Edit"}
                </Button>
              </div>

              {editingProfile ? (
                <div className="bg-secondary/30 p-6 rounded-sm space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs mb-1.5 block">Full Name</Label>
                      <Input
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, name: e.target.value })
                        }
                        className="rounded-sm bg-background"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Email</Label>
                      <Input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, email: e.target.value })
                        }
                        className="rounded-sm bg-background"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Phone</Label>
                      <Input
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, phone: e.target.value })
                        }
                        className="rounded-sm bg-background"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Date of Birth</Label>
                      <Input
                        type="date"
                        value={profileForm.dob}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, dob: e.target.value })
                        }
                        className="rounded-sm bg-background"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Gender</Label>
                      <Input
                        value={profileForm.gender}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, gender: e.target.value })
                        }
                        className="rounded-sm bg-background"
                      />
                    </div>
                  </div>
                  <Button onClick={saveProfile} className="rounded-sm">
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: User, label: "Full Name", value: profile.name },
                    { icon: Mail, label: "Email", value: profile.email },
                    { icon: Phone, label: "Phone", value: profile.phone },
                    { icon: Calendar, label: "Date of Birth", value: profile.dob },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-5 border border-border rounded-sm"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon className="h-4 w-4 text-accent" />
                        <p className="text-[11px] tracking-wide-luxe uppercase text-muted-foreground">
                          {item.label}
                        </p>
                      </div>
                      <p className="font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick stats */}
              <h3 className="font-serif text-xl pt-6">Quick Stats</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Package, label: "Total Orders", value: orders.length },
                  { icon: Heart, label: "Wishlist Items", value: wishlist.length },
                  { icon: Award, label: "Loyalty Points", value: profile.loyaltyPoints.toLocaleString() },
                  { icon: TrendingUp, label: "Lifetime Spend", value: `$${(profile.lifetimeSpend / 1000).toFixed(1)}k` },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-5 border border-border rounded-sm bg-secondary/20"
                  >
                    <stat.icon className="h-5 w-5 text-accent mb-3" />
                    <p className="font-serif text-2xl">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent order preview */}
              <div className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-xl">Recent Order</h3>
                  <button
                    onClick={() => setProfileTab("orders")}
                    className="text-sm text-accent hover:underline"
                  >
                    View All
                  </button>
                </div>
                {orders[0] && (
                  <div className="p-5 border border-border rounded-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium">{orders[0].orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(orders[0].createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-[10px] tracking-wide-luxe uppercase px-3 py-1 rounded",
                          statusColor(orders[0].status)
                        )}
                      >
                        {orders[0].status}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      {orders[0].items.map((item, i) => (
                        <img
                          key={i}
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-16 object-cover rounded-sm"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ORDERS */}
          {profileTab === "orders" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="font-serif text-2xl mb-4">Order History</h2>
              {orders.length === 0 ? (
                <div className="text-center py-16 border border-border rounded-sm">
                  <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">No orders yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your orders will appear here once placed.
                  </p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-border rounded-sm overflow-hidden"
                  >
                    <div className="bg-secondary/30 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          Placed on{" "}
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={cn(
                            "text-[10px] tracking-wide-luxe uppercase px-3 py-1 rounded",
                            statusColor(order.status)
                          )}
                        >
                          {order.status}
                        </span>
                        <span className="font-medium">
                          ${order.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="space-y-4">
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex gap-4 items-center p-2 -m-2 rounded-sm"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-20 object-cover rounded-sm"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-serif text-sm line-clamp-1">
                                {item.name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.color} · Size {item.size} · Qty{" "}
                                {item.quantity}
                              </p>
                              <p className="text-sm font-medium mt-1">
                                ${(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-border">
                        {order.trackingNumber && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-sm text-xs"
                            onClick={() =>
                              toast.info(`Tracking: ${order.trackingNumber}`)
                            }
                          >
                            <Package className="h-3.5 w-3.5 mr-2" />
                            Track Package
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-sm text-xs"
                          onClick={() => toast.info("Reorder initiated")}
                        >
                          <ShoppingBag className="h-3.5 w-3.5 mr-2" />
                          Reorder
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-sm text-xs"
                          onClick={() => toast.info("Invoice downloaded")}
                        >
                          Download Invoice
                        </Button>
                        {order.status === "Delivered" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-sm text-xs"
                            onClick={() => toast.info("Return flow started")}
                          >
                            Return Item
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* ADDRESSES */}
          {profileTab === "addresses" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl">Saved Addresses</h2>
                <Button
                  onClick={() => {
                    setEditingAddr(null);
                    setAddrDialogOpen(true);
                  }}
                  className="rounded-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-5 border border-border rounded-sm relative"
                  >
                    {addr.isDefault && (
                      <span className="absolute top-4 right-4 text-[10px] tracking-wide-luxe uppercase bg-accent/15 text-accent px-2 py-0.5">
                        Default
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-accent" />
                      <p className="font-medium">{addr.label}</p>
                    </div>
                    <p className="text-sm font-medium">{addr.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {addr.line1}
                      {addr.line2 ? `, ${addr.line2}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {addr.city}, {addr.state} {addr.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {addr.country}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {addr.phone}
                    </p>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-sm text-xs h-8"
                        onClick={() => {
                          setEditingAddr(addr);
                          setAddrDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-3 w-3 mr-1.5" />
                        Edit
                      </Button>
                      {!addr.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-sm text-xs h-8"
                          onClick={() => {
                            updateAddress(addr.id, { isDefault: true });
                          }}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 text-destructive hover:text-destructive ml-auto"
                        onClick={() => {
                          deleteAddress(addr.id);
                          toast.success("Address removed");
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <AddressDialog
                open={addrDialogOpen}
                onOpenChange={setAddrDialogOpen}
                editingAddr={editingAddr}
                onSave={(data) => {
                  if (editingAddr) {
                    updateAddress(editingAddr.id, data);
                    toast.success("Address updated");
                  } else {
                    addAddress(data);
                    toast.success("Address added");
                  }
                  setAddrDialogOpen(false);
                }}
              />
            </motion.div>
          )}

          {/* PAYMENT */}
          {profileTab === "payment" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl">Payment Methods</h2>
                <Button
                  onClick={() => setPmDialogOpen(true)}
                  className="rounded-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Card
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className="relative p-6 rounded-sm bg-gradient-to-br from-primary to-primary/85 text-primary-foreground min-h-[160px] flex flex-col justify-between"
                  >
                    {pm.isDefault && (
                      <span className="absolute top-4 right-4 text-[10px] tracking-wide-luxe uppercase bg-accent text-accent-foreground px-2 py-0.5">
                        Default
                      </span>
                    )}
                    <div className="flex items-start justify-between">
                      <CreditCard className="h-7 w-7 text-accent" />
                      <p className="text-xs uppercase tracking-wide-luxe opacity-70">
                        {pm.type}
                      </p>
                    </div>
                    <p className="font-mono text-lg tracking-widest">
                      ···· ···· ···· {pm.last4}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] tracking-wide-luxe uppercase opacity-60">
                          Card Holder
                        </p>
                        <p className="text-sm">{pm.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] tracking-wide-luxe uppercase opacity-60">
                          Expires
                        </p>
                        <p className="text-sm">{pm.expiry}</p>
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 flex gap-1">
                      {!pm.isDefault && (
                        <button
                          onClick={() => {
                            setDefaultPayment(pm.id);
                            toast.success("Default payment updated");
                          }}
                          className="text-[10px] tracking-wide-luxe uppercase bg-primary-foreground/10 backdrop-blur px-2 py-1 rounded"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => {
                          deletePaymentMethod(pm.id);
                          toast.success("Card removed");
                        }}
                        className="w-7 h-7 bg-primary-foreground/10 backdrop-blur rounded flex items-center justify-center hover:bg-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <PaymentDialog
                open={pmDialogOpen}
                onOpenChange={setPmDialogOpen}
                onSave={(data) => {
                  addPaymentMethod(data);
                  toast.success("Payment method added");
                  setPmDialogOpen(false);
                }}
              />
            </motion.div>
          )}

          {/* WISHLIST */}
          {profileTab === "wishlist" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="font-serif text-2xl">My Wishlist</h2>
              {wishlist.length === 0 ? (
                <div className="text-center py-16 border border-border rounded-sm">
                  <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">No saved items</p>
                  <Button
                    onClick={() => setView("shop")}
                    className="mt-4 rounded-sm"
                  >
                    Browse Collection
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlist.map((p) => {
                    return (
                      <div
                        key={p.id}
                        className="flex gap-4 p-3 border border-border rounded-sm hover:bg-muted/30 transition-colors"
                      >
                        <button onClick={() => openProduct(p.id)}>
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-20 h-24 object-cover rounded-sm"
                          />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] tracking-luxe uppercase text-muted-foreground">
                            {p.brand}
                          </p>
                          <button
                            onClick={() => openProduct(p.id)}
                            className="font-serif text-lg text-left hover:text-accent transition-colors"
                          >
                            {p.name}
                          </button>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-accent text-accent" />
                            <span className="text-xs text-muted-foreground">
                              {p.rating} ({p.reviewCount})
                            </span>
                          </div>
                          <p className="font-medium mt-2">${p.price.toLocaleString()}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            className="rounded-sm text-xs h-8"
                            onClick={() => {
                              store.addToCart(p as any, p.sizes[0], p.colors[0].name, 1);
                              toast.success("Added to bag");
                            }}
                          >
                            <ShoppingBag className="h-3 w-3 mr-1.5" />
                            Add to Bag
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-8 text-destructive"
                            onClick={() => toggleWishlist(p.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1.5" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* LOYALTY */}
          {profileTab === "loyalty" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="font-serif text-2xl">Atelier Circle</h2>

              {/* Tier card */}
              <div className="bg-gradient-to-br from-accent to-accent/80 text-accent-foreground p-8 rounded-sm">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="text-[11px] tracking-luxe uppercase opacity-70 mb-1">
                      Current Tier
                    </p>
                    <p className="font-serif text-4xl">{profile.tier}</p>
                  </div>
                  <Award className="h-12 w-12 opacity-80" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] tracking-wide-luxe uppercase opacity-70">
                      Available Points
                    </p>
                    <p className="font-serif text-3xl">
                      {profile.loyaltyPoints.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-wide-luxe uppercase opacity-70">
                      Lifetime Spend
                    </p>
                    <p className="font-serif text-3xl">
                      ${(profile.lifetimeSpend / 1000).toFixed(1)}k
                    </p>
                  </div>
                </div>
              </div>

              {/* Tier progress */}
              <div className="p-5 border border-border rounded-sm">
                <p className="text-sm font-medium mb-3">Tier Progress</p>
                <div className="space-y-3">
                  {[
                    { name: "Silver", threshold: 0, color: "bg-gray-400" },
                    { name: "Gold", threshold: 5000, color: "bg-amber-500" },
                    { name: "Platinum", threshold: 20000, color: "bg-purple-500" },
                  ].map((tier) => {
                    const isCurrent = tier.name === profile.tier;
                    const isPast = profile.lifetimeSpend >= tier.threshold;
                    return (
                      <div key={tier.name} className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full",
                            isPast ? tier.color : "bg-muted"
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm flex-1",
                            isCurrent ? "font-bold" : "text-muted-foreground"
                          )}
                        >
                          {tier.name}
                          {isCurrent && " (Current)"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ${tier.threshold.toLocaleString()}+
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Benefits */}
              <h3 className="font-serif text-xl pt-4">Your Benefits</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Truck, title: "Free Express Shipping", desc: "On every order, no minimum" },
                  { icon: Gift, title: "Birthday Gift", desc: "A complimentary piece each year" },
                  { icon: Star, title: "Early Access", desc: "Shop new collections 48h before launch" },
                  { icon: User, title: "Personal Stylist", desc: "1:1 styling sessions on request" },
                  { icon: RefreshCw, title: "Extended Returns", desc: "60-day return window" },
                  { icon: Award, title: "Points Multiplier", desc: "Earn 1.5× points on every order" },
                ].map((b) => (
                  <div
                    key={b.title}
                    className="p-4 border border-border rounded-sm flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                      <b.icon className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{b.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* RECENTLY VIEWED */}
          {profileTab === "recently-viewed" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="font-serif text-2xl">Recently Viewed</h2>
              {lastViewedProductIds.length === 0 ? (
                <div className="text-center py-16 border border-border rounded-sm">
                  <Eye className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">No recently viewed items</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Items you view will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {lastViewedProductIds.map((id) => {
                    const p = getProductById(id);
                    if (!p) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => openProduct(id)}
                        className="text-left group"
                      >
                        <div className="aspect-[3/4] overflow-hidden rounded-sm bg-muted mb-2">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <p className="text-sm font-serif line-clamp-1 group-hover:text-accent transition-colors">
                          {p.name}
                        </p>
                        <p className="text-sm font-medium">${p.price.toLocaleString()}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* NOTIFICATIONS */}
          {profileTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="font-serif text-2xl">Notification Preferences</h2>
              <div className="space-y-3">
                {[
                  {
                    key: "orderUpdates" as const,
                    title: "Order Updates",
                    desc: "Receive notifications about your order status, shipping, and delivery",
                  },
                  {
                    key: "promotions" as const,
                    title: "Promotions & Offers",
                    desc: "Be the first to know about sales and exclusive offers",
                  },
                  {
                    key: "newsletter" as const,
                    title: "Newsletter",
                    desc: "Monthly editorial content and style inspiration",
                  },
                  {
                    key: "priceAlerts" as const,
                    title: "Price Drop Alerts",
                    desc: "Get notified when items on your wishlist go on sale",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-5 border border-border rounded-sm"
                  >
                    <div className="flex-1 pr-4">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    <Switch
                      checked={notificationPrefs[item.key]}
                      onCheckedChange={(checked) => {
                        updateNotificationPrefs({ [item.key]: checked });
                        toast.success(`${item.title} ${checked ? "enabled" : "disabled"}`);
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-border">
                <h3 className="font-serif text-xl mb-4">Contact Channels</h3>
                <div className="space-y-3">
                  {["Email", "SMS", "Push Notifications"].map((ch) => (
                    <div
                      key={ch}
                      className="flex items-center justify-between p-4 border border-border rounded-sm"
                    >
                      <span className="text-sm font-medium">{ch}</span>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* SETTINGS */}
          {profileTab === "settings" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="font-serif text-2xl">Account Settings</h2>

              {/* Password */}
              <div className="p-6 border border-border rounded-sm">
                <h3 className="font-serif text-lg mb-4">Change Password</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs mb-1.5 block">Current Password</Label>
                    <Input type="password" placeholder="••••••••" className="rounded-sm" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs mb-1.5 block">New Password</Label>
                      <Input type="password" placeholder="••••••••" className="rounded-sm" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Confirm New Password</Label>
                      <Input type="password" placeholder="••••••••" className="rounded-sm" />
                    </div>
                  </div>
                </div>
                <Button
                  className="mt-4 rounded-sm"
                  onClick={() => toast.success("Password updated")}
                >
                  Update Password
                </Button>
              </div>

              {/* Preferences */}
              <div className="p-6 border border-border rounded-sm">
                <h3 className="font-serif text-lg mb-4">Preferences</h3>
                <div className="space-y-3">
                  {[
                    { label: "Currency", value: "USD ($)" },
                    { label: "Language", value: "English" },
                    { label: "Size System", value: "US" },
                    { label: "Region", value: "United States" },
                  ].map((pref) => (
                    <div
                      key={pref.label}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <span className="text-sm">{pref.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{pref.value}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy */}
              <div className="p-6 border border-border rounded-sm">
                <h3 className="font-serif text-lg mb-4">Privacy & Data</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => toast.info("Data download initiated")}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/30 rounded-sm text-left"
                  >
                    <span className="text-sm">Download My Data</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => toast.info("Privacy policy opened")}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/30 rounded-sm text-left"
                  >
                    <span className="text-sm">Privacy Policy</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete your account? This cannot be undone.")) {
                        toast.info("Account deletion requested");
                      }
                    }}
                    className="w-full flex items-center justify-between p-3 hover:bg-destructive/10 text-destructive rounded-sm text-left"
                  >
                    <span className="text-sm">Delete Account</span>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="rounded-sm text-destructive hover:text-destructive hover:bg-destructive/5"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// Address dialog
function AddressDialog({
  open,
  onOpenChange,
  editingAddr,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingAddr: Address | null;
  onSave: (data: Omit<Address, "id">) => void;
}) {
  const [form, setForm] = useState<Omit<Address, "id">>({
    label: editingAddr?.label || "",
    fullName: editingAddr?.fullName || "",
    line1: editingAddr?.line1 || "",
    line2: editingAddr?.line2 || "",
    city: editingAddr?.city || "",
    state: editingAddr?.state || "",
    postalCode: editingAddr?.postalCode || "",
    country: editingAddr?.country || "United States",
    phone: editingAddr?.phone || "",
    isDefault: editingAddr?.isDefault || false,
  });

  // Reset form when dialog opens
  useState(() => {
    if (open) {
      setForm({
        label: editingAddr?.label || "",
        fullName: editingAddr?.fullName || "",
        line1: editingAddr?.line1 || "",
        line2: editingAddr?.line2 || "",
        city: editingAddr?.city || "",
        state: editingAddr?.state || "",
        postalCode: editingAddr?.postalCode || "",
        country: editingAddr?.country || "United States",
        phone: editingAddr?.phone || "",
        isDefault: editingAddr?.isDefault || false,
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingAddr ? "Edit Address" : "Add New Address"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Label</Label>
              <Input
                placeholder="Home, Office..."
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Full Name</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="rounded-sm"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Address Line 1</Label>
            <Input
              value={form.line1}
              onChange={(e) => setForm({ ...form, line1: e.target.value })}
              className="rounded-sm"
            />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Address Line 2 (Optional)</Label>
            <Input
              value={form.line2}
              onChange={(e) => setForm({ ...form, line2: e.target.value })}
              className="rounded-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">City</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">State</Label>
              <Input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="rounded-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Postal Code</Label>
              <Input
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-sm"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 pt-2">
            <Switch
              checked={form.isDefault}
              onCheckedChange={(c) => setForm({ ...form, isDefault: c })}
            />
            <span className="text-sm">Set as default address</span>
          </label>
        </div>
        <Button
          onClick={() => onSave(form)}
          className="rounded-sm mt-2"
          disabled={!form.label || !form.fullName || !form.line1 || !form.city}
        >
          {editingAddr ? "Save Changes" : "Add Address"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// Payment dialog
function PaymentDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (data: Omit<PaymentMethod, "id">) => void;
}) {
  const [form, setForm] = useState({
    type: "visa" as "visa" | "mastercard" | "amex",
    last4: "",
    expiry: "",
    name: "",
    isDefault: false,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs mb-1.5 block">Card Number</Label>
            <Input
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              value={form.last4}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(-4);
                setForm({ ...form, last4: digits });
              }}
              className="rounded-sm"
            />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Cardholder Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Expiry (MM/YY)</Label>
              <Input
                placeholder="MM/YY"
                maxLength={5}
                value={form.expiry}
                onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Type</Label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full h-10 px-3 rounded-sm border border-input bg-background text-sm"
              >
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">Amex</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 pt-2">
            <Switch
              checked={form.isDefault}
              onCheckedChange={(c) => setForm({ ...form, isDefault: c })}
            />
            <span className="text-sm">Set as default payment method</span>
          </label>
        </div>
        <Button
          onClick={() => onSave(form)}
          className="rounded-sm mt-2"
          disabled={!form.last4 || !form.name || !form.expiry}
        >
          Add Card
        </Button>
      </DialogContent>
    </Dialog>
  );
}
