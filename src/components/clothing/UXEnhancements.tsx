"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Sparkles, MapPin, Gift } from "lucide-react";
import { useStore, cartCount, cartSubtotal } from "@/lib/store";
import { useCurrency } from "@/lib/use-currency";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Feature 1: Sticky Add-to-Bar on mobile product pages
export function StickyAddToBar({ product, onAddToCart }: { product: any; onAddToCart: () => void }) {
  const [visible, setVisible] = useState(false);
  const { convert } = useCurrency();

  useEffect(() => {
    const onScroll = () => {
      // Show after scrolling past the fold (600px) but only on mobile
      setVisible(window.scrollY > 600 && window.innerWidth < 768);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border p-3 flex items-center gap-3 md:hidden"
        >
          <img src={product.images[0]} alt={product.name} className="w-12 h-14 object-cover rounded-sm shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium line-clamp-1">{product.name}</p>
            <p className="text-sm font-serif text-accent">{convert(product.price)}</p>
          </div>
          <Button onClick={onAddToCart} className="rounded-none h-10 px-4 text-xs uppercase shrink-0">
            <ShoppingBag className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Feature 3: Cart persistence welcome-back toast
export function CartWelcomeBack() {
  const { cart, setCartDrawerOpen } = useStore();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (shown) return;
    const timer = setTimeout(() => {
      if (cart.length > 0) {
        const count = cartCount(cart);
        const total = cartSubtotal(cart);
        toast.success(`Welcome back! You have ${count} ${count === 1 ? "item" : "items"} in your bag`, {
          description: `Total: $${total.toLocaleString()} · Tap to view`,
          duration: 6000,
          action: {
            label: "View Bag",
            onClick: () => setCartDrawerOpen(true),
          },
        });
        setShown(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [cart, shown, setCartDrawerOpen]);

  return null;
}

// Feature 4: Stock counter animation
export function StockCounter({ inStock }: { inStock: number }) {
  const [displayStock, setDisplayStock] = useState(inStock);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (inStock !== displayStock) {
      Promise.resolve().then(() => {
        setDisplayStock(inStock);
        setFlash(true);
        setTimeout(() => setFlash(false), 1000);
      });
    }
  }, [inStock, displayStock]);

  if (inStock > 10) return null;

  return (
    <motion.div
      animate={flash ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.5 }}
      className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-sm ${
        inStock <= 5 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      <motion.span
        animate={flash ? { rotate: [0, 360] } : {}}
        transition={{ duration: 0.5 }}
      >
        ⚡
      </motion.span>
      <span className="font-medium">Only {displayStock} left — order soon</span>
    </motion.div>
  );
}

// Feature 5: Product availability by location
export function LocationAvailability() {
  const [location, setLocation] = useState<string>("your country");

  useEffect(() => {
    // Detect user's country from timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const countryMap: Record<string, string> = {
      "America/New_York": "the United States",
      "America/Los_Angeles": "the United States",
      "America/Chicago": "the United States",
      "Europe/London": "the United Kingdom",
      "Europe/Paris": "France",
      "Europe/Rome": "Italy",
      "Europe/Berlin": "Germany",
      "Europe/Madrid": "Spain",
      "Asia/Kolkata": "India",
      "Asia/Dubai": "the UAE",
      "Asia/Tokyo": "Japan",
      "Australia/Sydney": "Australia",
    };
    Promise.resolve().then(() => setLocation(countryMap[tz] || "your country"));
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm bg-secondary/40 px-4 py-2.5 rounded-sm">
      <MapPin className="h-4 w-4 text-accent shrink-0" />
      <span className="text-muted-foreground">
        Ships to <span className="text-foreground font-medium">{location}</span> in 2-4 business days
      </span>
    </div>
  );
}

// Feature 7: Exit intent popup (mobile scroll-up detection)
export function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [shown, setShown] = useState(false);
  const lastScrollY = useRef(0);
  const { setView } = useStore();

  useEffect(() => {
    if (shown) return;

    const handleScroll = () => {
      const currentY = window.scrollY;
      // Detect fast scroll-up (exit intent on mobile)
      if (currentY < lastScrollY.current - 100 && currentY > 300 && window.innerWidth < 768) {
        setShow(true);
        setShown(true);
      }
      lastScrollY.current = currentY;
    };

    // Desktop: mouse leaves top
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10 && !shown) {
        setShow(true);
        setShown(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [shown]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShow(false)}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background rounded-sm max-w-md p-8 text-center shadow-2xl relative"
          >
            <button onClick={() => setShow(false)} className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
              <X className="h-4 w-4" />
            </button>
            <div className="w-16 h-16 mx-auto rounded-full bg-accent/15 flex items-center justify-center mb-4">
              <Gift className="h-7 w-7 text-accent" />
            </div>
            <h3 className="font-serif text-2xl mb-2">Wait! Don't leave yet</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Sign up for the Atelier Circle and get <span className="text-accent font-medium">10% off</span> your first order,
              plus 100 bonus loyalty points.
            </p>
            <Button
              onClick={() => { setShow(false); setView("profile"); }}
              className="w-full rounded-none h-12 text-sm tracking-wide-luxe uppercase"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Claim My 10% Off
            </Button>
            <p className="text-[10px] text-muted-foreground mt-3">No spam. Unsubscribe anytime.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
