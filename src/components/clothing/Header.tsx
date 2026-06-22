"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  LogOut,
  Crown,
  Home,
  Sparkles,
  Award,
} from "lucide-react";
import { useStore, cartCount } from "@/lib/store";
import { products, categories } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { isClientAdminEmail } from "@/lib/client-admin";
import { MegaMenu } from "./MegaMenu";
import { ThemeToggle } from "./ThemeToggle";
import { CurrencySelector } from "./CurrencySelector";
import { AuthModal } from "./AuthModal";
import { toast } from "sonner";

export function Header() {
  const { data: session, status } = useSession();
  const {
    cart,
    wishlist,
    setView,
    setCategory,
    selectedCategory,
    openProduct,
    view,
    setCartDrawerOpen,
    setProfileTab,
    cartBounce,
  } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [mobileCategoryTree, setMobileCategoryTree] = useState<any[]>(
    // Fallback: show flat categories immediately (before API loads)
    categories
      .filter((c) => c !== "All")
      .map((c) => ({
        id: `fb-${c}`,
        name: c,
        slug: c.toLowerCase(),
        children: [],
      }))
  );
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch top-level categories for mobile menu — with fallback
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => {
        if (!r.ok) throw new Error("API failed");
        return r.json();
      })
      .then((data) => {
        if (data.tree && data.tree.length > 0) {
          setMobileCategoryTree(data.tree);
        }
        // else keep using fallback already in state
      })
      .catch(() => {
        // API failed — keep using fallback categories already in state
      });
  }, []);

  const count = cartCount(cart);
  const isAuthenticated = status === "authenticated" && !!session?.user;
  const userName = (session?.user as any)?.name || "Account";

  const lowerQuery = searchQuery.toLowerCase().trim();
  const searchResults = lowerQuery
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery) ||
            p.subcategory.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 6)
    : [];

  // Autocomplete: category suggestions from the tree (already fetched for mobile menu)
  const categorySuggestions = lowerQuery
    ? (function () {
        const matches: { name: string; slug: string; path: string }[] = [];
        const walk = (cats: any[], prefix: string) => {
          for (const c of cats || []) {
            const path = prefix + c.name;
            if (c.name.toLowerCase().includes(lowerQuery)) {
              matches.push({ name: c.name, slug: c.slug, path });
            }
            walk(c.children || [], path + " › ");
          }
        };
        walk(mobileCategoryTree, "");
        return matches.slice(0, 4);
      })()
    : [];

  // Trending searches when no query
  const trendingSearches = [
    "Cashmere",
    "Wool Coat",
    "Leather Bag",
    "Linen Shirt",
    "Boots",
    "Silk Dress",
  ];

  const handleNav = (category: string, targetView: "shop" | "home" = "shop") => {
    setCategory(category);
    setView(targetView);
    setMobileOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openAuth = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    toast.success("Signed out");
    setTimeout(() => window.location.reload(), 300);
  };

  const handleAccountClick = () => {
    if (isAuthenticated) {
      setView("profile");
    } else {
      openAuth("signin");
    }
  };

  return (
    <>
      {/* Announcement bar — gradient with subtle shine */}
      <div
        className="py-2 overflow-hidden relative"
        style={{
          background: `linear-gradient(90deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 80%, var(--accent)) 50%, var(--primary) 100%)`,
        }}
      >
        <div className="flex whitespace-nowrap animate-marquee">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0">
              {[
                "Complimentary express shipping on orders over $250",
                "New Autumn / Winter 2026 Collection — Now Available",
                "Lifetime repairs on all MAISON ÉLÉGANCE pieces",
                "Members earn 1 point per $1 — Join the Atelier Circle",
              ].map((text, j) => (
                <span
                  key={j}
                  className="text-[11px] tracking-wide-luxe uppercase mx-12 inline-flex items-center gap-3 text-primary-foreground"
                >
                  <span style={{ color: "var(--accent)" }}>✦</span>
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
        {/* Subtle shine overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)",
          }}
        />
      </div>

      {/* Header — glassmorphism with gradient bottom border */}
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-500",
          scrolled
            ? "bg-background/85 backdrop-blur-xl shadow-lg border-b"
            : "bg-background/60 backdrop-blur-md border-b"
        )}
        style={{
          borderColor: scrolled
            ? "var(--border)"
            : "color-mix(in srgb, var(--accent) 20%, transparent)",
          boxShadow: scrolled
            ? "0 4px 30px rgba(0,0,0,0.06), 0 1px 0 color-mix(in srgb, var(--accent) 15%, transparent)"
            : "none",
        }}
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-20 gap-8">
            {/* Left: Mobile menu + Nav */}
            <div className="flex items-center gap-8 flex-1">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] sm:w-[380px] p-0">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-6 border-b">
                      <span className="font-serif text-xl tracking-wide">
                        MAISON ÉLÉGANCE
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileOpen(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <nav className="flex-1 p-6 space-y-1">
                      <button
                        onClick={() => {
                          useStore.getState().setView("home");
                          setMobileOpen(false);
                          if (typeof window !== "undefined") {
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }
                        }}
                        className="w-full flex items-center justify-between py-3 text-left hover:text-accent transition-colors group"
                      >
                        <span className="text-lg font-serif inline-flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          Home
                        </span>
                        <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </button>
                      {mobileCategoryTree.map((cat) => (
                        <div key={cat.id}>
                          <div className="flex items-center">
                            <button
                              onClick={() => handleNav(cat.slug)}
                              className="flex-1 flex items-center justify-between py-3 text-left hover:text-accent transition-colors group"
                            >
                              <span className="text-lg font-serif">
                                {cat.name}
                              </span>
                              <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </button>
                            {cat.children?.length > 0 && (
                              <button
                                onClick={() =>
                                  setExpandedMobileCat(
                                    expandedMobileCat === cat.id ? null : cat.id
                                  )
                                }
                                className="ml-2 p-2 hover:bg-muted rounded-sm"
                                aria-label="Expand subcategories"
                              >
                                {expandedMobileCat === cat.id ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 rotate-90" />
                                )}
                              </button>
                            )}
                          </div>
                          {expandedMobileCat === cat.id && cat.children?.length > 0 && (
                            <div className="pl-4 pb-2 space-y-1 border-l border-border ml-2">
                              {cat.children.map((sub: any) => (
                                <button
                                  key={sub.id}
                                  onClick={() => handleNav(sub.slug)}
                                  className="block w-full text-left py-2 text-sm text-muted-foreground hover:text-accent transition-colors"
                                >
                                  {sub.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {mobileCategoryTree.length === 0 && (
                        <p className="text-xs text-muted-foreground py-2">
                          Loading categories...
                        </p>
                      )}
                      <div className="h-px bg-border my-4" />
                      {/* Community + Subscription in mobile menu */}
                      <button
                        onClick={() => {
                          setView("community");
                          setMobileOpen(false);
                          if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="w-full flex items-center justify-between py-3 text-left hover:text-accent transition-colors group"
                      >
                        <span className="text-lg font-serif inline-flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-accent" />
                          Community
                        </span>
                        <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </button>
                      <button
                        onClick={() => {
                          setView("subscription");
                          setMobileOpen(false);
                          if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="w-full flex items-center justify-between py-3 text-left hover:text-accent transition-colors group"
                      >
                        <span className="text-lg font-serif">Atelier Box</span>
                        <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </button>
                      <div className="h-px bg-border my-4" />
                      {isAuthenticated ? (
                        <>
                          <div className="px-2 mb-2">
                            <p className="text-[10px] tracking-wide-luxe uppercase text-muted-foreground">
                              Account
                            </p>
                            <p className="text-sm font-medium truncate mt-0.5">
                              {userName}
                            </p>
                            {(session.user as any)?.tier && (
                              <p className="text-[10px] tracking-wide-luxe uppercase text-accent mt-0.5">
                                {(session.user as any).tier} Member
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setView("profile");
                              setProfileTab("overview");
                              setMobileOpen(false);
                              if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="w-full flex items-center justify-between py-3 text-left hover:text-accent transition-colors group"
                          >
                            <span className="text-lg font-serif inline-flex items-center gap-2">
                              <User className="h-4 w-4" />
                              My Profile
                            </span>
                            <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </button>
                          <button
                            onClick={() => {
                              setView("profile");
                              setProfileTab("orders");
                              setMobileOpen(false);
                              if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="w-full flex items-center justify-between py-3 text-left hover:text-accent transition-colors group"
                          >
                            <span className="text-lg font-serif inline-flex items-center gap-2">
                              <ShoppingBag className="h-4 w-4" />
                              My Orders
                            </span>
                            <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </button>
                          <button
                            onClick={() => {
                              setView("wishlist");
                              setMobileOpen(false);
                              if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="w-full flex items-center justify-between py-3 text-left hover:text-accent transition-colors group"
                          >
                            <span className="text-lg font-serif inline-flex items-center gap-2">
                              <Heart className="h-4 w-4" />
                              Wishlist
                            </span>
                            <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </button>
                          <button
                            onClick={() => {
                              setView("profile");
                              setProfileTab("loyalty");
                              setMobileOpen(false);
                              if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="w-full flex items-center justify-between py-3 text-left hover:text-accent transition-colors group"
                          >
                            <span className="text-lg font-serif inline-flex items-center gap-2">
                              <Award className="h-4 w-4 text-accent" />
                              Loyalty & Points
                            </span>
                            <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </button>
                          {((session.user as any)?.isAdmin || isClientAdminEmail(session?.user?.email)) && (
                            <>
                              <div className="h-px bg-border my-3" />
                              <button
                                onClick={() => {
                                  setView("admin");
                                  setMobileOpen(false);
                                  if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className="w-full flex items-center justify-between py-3 text-left text-accent hover:text-accent transition-colors group"
                              >
                                <span className="text-lg font-serif inline-flex items-center gap-2">
                                  <Crown className="h-4 w-4" />
                                  Admin Dashboard
                                </span>
                                <ChevronRight className="h-4 w-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                              </button>
                            </>
                          )}
                          <div className="h-px bg-border my-3" />
                          <button
                            onClick={() => {
                              handleSignOut();
                              setMobileOpen(false);
                            }}
                            className="w-full flex items-center justify-between py-3 text-left hover:text-destructive transition-colors group"
                          >
                            <span className="text-lg font-serif inline-flex items-center gap-2">
                              <LogOut className="h-4 w-4" />
                              Sign Out
                            </span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            openAuth("signin");
                            setMobileOpen(false);
                          }}
                          className="w-full flex items-center justify-between py-3 text-left hover:text-accent transition-colors group"
                        >
                          <span className="text-lg font-serif inline-flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Sign In / Register
                          </span>
                          <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </button>
                      )}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Mega menu replaces simple nav */}
              <MegaMenu />
            </div>

            {/* Center: Logo */}
            <button
              onClick={() => setView("home")}
              className="flex flex-col items-center group"
              aria-label="MAISON ÉLÉGANCE home"
            >
              <span className="font-serif text-xl md:text-2xl tracking-wide leading-none">
                MAISON ÉLÉGANCE
              </span>
              <span className="text-[9px] tracking-luxe uppercase text-muted-foreground mt-1">
                Paris · Florence · Tokyo
              </span>
            </button>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen((s) => !s)}
                aria-label="Search"
                className="relative"
              >
                <Search className="h-[18px] w-[18px]" />
              </Button>

              <div className="hidden sm:block">
                <CurrencySelector compact />
              </div>

              <ThemeToggle />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView("wishlist")}
                aria-label="Wishlist"
                className="relative"
              >
                <Heart className="h-[18px] w-[18px]" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 bg-accent text-accent-foreground text-[10px] font-medium min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                    {wishlist.length}
                  </span>
                )}
              </Button>

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Account menu"
                      className="inline-flex"
                    >
                      {session?.user?.image ? (
                        <img
                          src={(session.user as any).image}
                          alt={userName}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-[18px] w-[18px]" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">{userName}</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {(session.user as any)?.email}
                        </span>
                        {(session.user as any)?.tier && (
                          <span className="text-[10px] tracking-wide-luxe uppercase text-accent mt-1">
                            {(session.user as any).tier} Member
                          </span>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setView("profile");
                        setProfileTab("overview");
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setView("profile");
                        setProfileTab("orders");
                      }}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setView("profile");
                        setProfileTab("loyalty");
                      }}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Loyalty & Points
                    </DropdownMenuItem>
                    {((session.user as any)?.isAdmin || isClientAdminEmail(session?.user?.email)) && (
                      <DropdownMenuItem onClick={() => setView("admin")}>
                        <Crown className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openAuth("signin")}
                  aria-label="Sign in"
                  className="inline-flex"
                >
                  <User className="h-[18px] w-[18px]" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCartDrawerOpen(true)}
                aria-label="Cart"
                className="relative"
              >
                <motion.div
                  key={cartBounce}
                  animate={cartBounce > 0 ? { scale: [1, 1.3, 0.9, 1.1, 1], y: [0, -6, 0, -2, 0] } : {}}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <ShoppingBag className="h-[18px] w-[18px]" />
                </motion.div>
                {count > 0 && (
                  <span className="absolute top-1 right-1 bg-accent text-accent-foreground text-[10px] font-medium min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                    {count}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Search drawer */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-8">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 border-b-2 pb-3">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <Input
                    autoFocus
                    placeholder="Search for coats, dresses, leather goods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 px-0 h-10 text-lg focus-visible:ring-0 bg-transparent"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                {/* Category suggestions (autocomplete) */}
                {categorySuggestions.length > 0 && (
                  <div className="mt-6">
                    <p className="text-[10px] tracking-wide-luxe uppercase text-muted-foreground mb-3">
                      Categories
                    </p>
                    <div className="space-y-1">
                      {categorySuggestions.map((c) => (
                        <button
                          key={c.slug}
                          onClick={() => {
                            setCategory(c.slug);
                            setView("shop");
                            setSearchOpen(false);
                            setSearchQuery("");
                            if (typeof window !== "undefined") {
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                          className="w-full flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors text-left"
                        >
                          <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                            <Search className="h-4 w-4 text-accent" />
                          </div>
                          <span className="text-sm font-medium">{c.path}</span>
                          <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product results */}
                {searchResults.length > 0 && (
                  <div className="mt-6">
                    <p className="text-[10px] tracking-wide-luxe uppercase text-muted-foreground mb-3">
                      Products
                    </p>
                    <div className="space-y-2">
                      {searchResults.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            openProduct(p.id);
                            setSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="w-full flex items-center gap-4 p-2 hover:bg-muted rounded-lg transition-colors text-left"
                        >
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-14 h-14 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{p.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {p.category} · ${p.price}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {searchQuery &&
                  searchResults.length === 0 &&
                  categorySuggestions.length === 0 && (
                    <p className="mt-6 text-muted-foreground text-center">
                      No results for &ldquo;{searchQuery}&rdquo;
                    </p>
                  )}
                {!searchQuery && (
                  <div className="mt-6 space-y-4">
                    {/* AI Visual Search button */}
                    <button
                      onClick={() => {
                        setSearchOpen(false);
                        setView("visual-search");
                      }}
                      className="w-full flex items-center gap-3 p-3 border-2 border-accent/30 bg-accent/5 rounded-sm hover:bg-accent/10 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                        <Sparkles className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-accent">AI Visual Search</p>
                        <p className="text-xs text-muted-foreground">Upload a photo → find similar pieces</p>
                      </div>
                    </button>

                    <div>
                      <p className="text-[10px] tracking-wide-luxe uppercase text-muted-foreground mb-3">
                        Trending Searches
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {trendingSearches.map((term) => (
                          <button
                            key={term}
                            onClick={() => setSearchQuery(term)}
                            className="text-sm px-3 py-1.5 rounded-full bg-muted hover:bg-accent/15 hover:text-accent transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                    {mobileCategoryTree.length > 0 && (
                      <div>
                        <p className="text-[10px] tracking-wide-luxe uppercase text-muted-foreground mb-3">
                          Browse by Category
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {mobileCategoryTree.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => {
                                setCategory(cat.slug);
                                setView("shop");
                                setSearchOpen(false);
                                if (typeof window !== "undefined") {
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }
                              }}
                              className="text-left text-sm px-3 py-2 rounded-sm border border-border hover:border-accent hover:text-accent transition-colors"
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}
