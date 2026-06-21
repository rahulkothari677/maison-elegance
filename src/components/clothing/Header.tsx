"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Crown,
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
import { MegaMenu } from "./MegaMenu";
import { ThemeToggle } from "./ThemeToggle";
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
  } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const count = cartCount(cart);
  const isAuthenticated = status === "authenticated" && !!session?.user;
  const userName = (session?.user as any)?.name || "Account";

  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.subcategory.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

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
      {/* Announcement bar */}
      <div className="bg-primary text-primary-foreground py-2 overflow-hidden">
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
                  className="text-[11px] tracking-wide-luxe uppercase mx-12 inline-flex items-center gap-3"
                >
                  <span className="opacity-60">✦</span>
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-500 border-b",
          scrolled
            ? "bg-background/95 backdrop-blur-xl shadow-sm border-border"
            : "bg-background border-transparent"
        )}
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Left: Mobile menu + Nav */}
            <div className="flex items-center gap-6 flex-1">
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
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => handleNav(cat)}
                          className="w-full flex items-center justify-between py-3 text-left hover:text-accent transition-colors group"
                        >
                          <span className="text-lg font-serif">{cat}</span>
                          <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                      <div className="h-px bg-border my-4" />
                      {isAuthenticated ? (
                        <>
                          <button
                            onClick={() => {
                              setView("profile");
                              setMobileOpen(false);
                            }}
                            className="w-full flex items-center justify-between py-3 text-left hover:text-accent transition-colors group"
                          >
                            <span className="text-lg font-serif">My Account</span>
                            <User className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                          </button>
                          <button
                            onClick={() => {
                              handleSignOut();
                              setMobileOpen(false);
                            }}
                            className="w-full flex items-center justify-between py-3 text-left hover:text-accent transition-colors group"
                          >
                            <span className="text-lg font-serif">Sign Out</span>
                            <LogOut className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
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
                          <span className="text-lg font-serif">Sign In</span>
                          <User className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
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
                      className="hidden sm:inline-flex"
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
                    {(session.user as any)?.isAdmin && (
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
                  className="hidden sm:inline-flex"
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
                <ShoppingBag className="h-[18px] w-[18px]" />
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
                {searchResults.length > 0 && (
                  <div className="mt-6 space-y-2">
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
                )}
                {searchQuery && searchResults.length === 0 && (
                  <p className="mt-6 text-muted-foreground text-center">
                    No results for &ldquo;{searchQuery}&rdquo;
                  </p>
                )}
                {!searchQuery && (
                  <div className="mt-6 flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-muted-foreground mr-2">
                      Popular:
                    </span>
                    {["Cashmere", "Wool Coat", "Leather Bag", "Linen Shirt"].map(
                      (term) => (
                        <button
                          key={term}
                          onClick={() => setSearchQuery(term)}
                          className="text-sm px-3 py-1 rounded-full bg-muted hover:bg-muted/70 transition-colors"
                        >
                          {term}
                        </button>
                      )
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
