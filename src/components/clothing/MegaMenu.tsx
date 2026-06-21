"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Home } from "lucide-react";
import { useStore } from "@/lib/store";
import { products, categories } from "@/lib/data";
import { cn } from "@/lib/utils";

const megaMenuData: Record<
  string,
  {
    title: string;
    items: { label: string; sub?: string }[];
    feature?: { title: string; desc: string; image: string; category: string };
  }
> = {
  Women: {
    title: "Women",
    items: [
      { label: "Dresses", sub: "Silk, linen, evening" },
      { label: "Knitwear", sub: "Cashmere, merino" },
      { label: "Shirts & Blouses", sub: "Silk, cotton, linen" },
      { label: "Outerwear", sub: "Coats, jackets" },
      { label: "Footwear", sub: "Heels, sneakers" },
      { label: "Accessories", sub: "Bags, scarves, eyewear" },
    ],
    feature: {
      title: "The Aurora Collection",
      desc: "Silk slip dresses in 9 shades",
      image:
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80",
      category: "Women",
    },
  },
  Men: {
    title: "Men",
    items: [
      { label: "Suits", sub: "Tailored, casual" },
      { label: "Shirts", sub: "Oxford, linen, poplin" },
      { label: "Knitwear", sub: "Cashmere, wool" },
      { label: "Denim", sub: "Selvedge, raw" },
      { label: "Outerwear", sub: "Coats, overshirts" },
      { label: "Footwear", sub: "Boots, sneakers" },
    ],
    feature: {
      title: "Sartorial Essentials",
      desc: "Half-canvas wool suits from Naples",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      category: "Men",
    },
  },
  Outerwear: {
    title: "Outerwear",
    items: [
      { label: "Wool Coats", sub: "Camel, charcoal, navy" },
      { label: "Tailored Overcoats", sub: "Half-canvas construction" },
      { label: "Overshirts", sub: "Wool blends, heavyweight" },
      { label: "Trench Coats", sub: "Cotton gabardine" },
      { label: "Blazers", sub: "Unstructured, structured" },
    ],
    feature: {
      title: "The Camille Coat",
      desc: "Italian wool-cashmere, hand-tailored in Florence",
      image:
        "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=600&q=80",
      category: "Outerwear",
    },
  },
  Footwear: {
    title: "Footwear",
    items: [
      { label: "Boots", sub: "Hand-welted, resoleable" },
      { label: "Sneakers", sub: "Court, minimalist" },
      { label: "Heels", sub: "Stiletto, block" },
      { label: "Loafers", sub: "Penny, tassel" },
      { label: "Oxfords", sub: "Wholecut, cap-toe" },
    ],
    feature: {
      title: "Verona Hand-Welted Boots",
      desc: "Built to outlive your wardrobe",
      image:
        "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80",
      category: "Footwear",
    },
  },
  Accessories: {
    title: "Accessories",
    items: [
      { label: "Bags", sub: "Totes, crossbody" },
      { label: "Eyewear", sub: "Acetate, polarized" },
      { label: "Watches", sub: "Automatic, quartz" },
      { label: "Scarves", sub: "Silk, cashmere" },
      { label: "Wallets", sub: "Card holders, bifolds" },
      { label: "Belts", sub: "Leather, reversible" },
    ],
    feature: {
      title: "Mira Leather Tote",
      desc: "Saddle-stitched Italian leather",
      image:
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
      category: "Accessories",
    },
  },
};

export function MegaMenu() {
  const { setCategory, setView } = useStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Called when hovering a category button — opens the mega menu for that cat
  const handleItemEnter = (cat: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveCategory(cat);
  };

  // Called when hovering the popup itself — just cancel any pending close
  const handlePopupEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveCategory(null), 200);
  };

  const goToCategory = (cat: string) => {
    setCategory(cat);
    setView("shop");
    setActiveCategory(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToSubcategory = (cat: string) => {
    goToCategory(cat);
  };

  const navCategories = categories.filter((c) => c !== "All");

  return (
    <nav
      className="hidden lg:flex items-center gap-6 relative"
      onMouseLeave={handleLeave}
    >
      {/* Home button — always visible, easy way back to home */}
      <button
        onClick={() => {
          useStore.getState().setView("home");
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        className={cn(
          "relative text-[12px] tracking-wide-luxe uppercase py-1 transition-colors hover:text-accent inline-flex items-center gap-1.5",
          useStore.getState().view === "home" && "text-accent"
        )}
        aria-label="Home"
      >
        <Home className="h-[14px] w-[14px]" />
        <span className="hidden xl:inline">Home</span>
      </button>

      {navCategories.map((cat) => {
        const data = megaMenuData[cat];
        const isActive = activeCategory === cat;
        return (
          <div
            key={cat}
            onMouseEnter={() => handleItemEnter(cat)}
            className="relative"
          >
            <button
              onClick={() => goToCategory(cat)}
              className={cn(
                "relative text-[12px] tracking-wide-luxe uppercase py-1 transition-colors hover:text-accent",
                isActive && "text-accent"
              )}
            >
              {cat}
              <span
                className={cn(
                  "absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-300",
                  isActive ? "w-full" : "w-0"
                )}
              />
            </button>
          </div>
        );
      })}

      <AnimatePresence>
        {activeCategory && megaMenuData[activeCategory] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={handlePopupEnter}
            onMouseLeave={handleLeave}
            // Anchor to left edge of nav (no left cutoff), with pt-2 bridge so
            // the hover area touches the nav row (no gap that closes the menu)
            className="absolute top-full left-0 pt-2 z-50"
          >
            <div className="w-[820px] max-w-[calc(100vw-2rem)] bg-background border border-border shadow-2xl rounded-sm overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_320px] gap-0">
              {/* Left column */}
              <div className="p-6 border-r border-border">
                <p className="text-[10px] tracking-luxe uppercase text-accent mb-4">
                  {megaMenuData[activeCategory].title} · Shop by Type
                </p>
                <ul className="space-y-1">
                  {megaMenuData[activeCategory].items
                    .slice(0, Math.ceil(megaMenuData[activeCategory].items.length / 2))
                    .map((item) => (
                      <li key={item.label}>
                        <button
                          onClick={() => goToSubcategory(activeCategory)}
                          className="group w-full flex items-center justify-between py-2 text-left hover:text-accent transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium">{item.label}</p>
                            {item.sub && (
                              <p className="text-xs text-muted-foreground">{item.sub}</p>
                            )}
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-accent" />
                        </button>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Middle column */}
              <div className="p-6 border-r border-border">
                <p className="text-[10px] tracking-luxe uppercase text-accent mb-4">
                  Featured
                </p>
                <ul className="space-y-1">
                  {megaMenuData[activeCategory].items
                    .slice(Math.ceil(megaMenuData[activeCategory].items.length / 2))
                    .map((item) => (
                      <li key={item.label}>
                        <button
                          onClick={() => goToSubcategory(activeCategory)}
                          className="group w-full flex items-center justify-between py-2 text-left hover:text-accent transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium">{item.label}</p>
                            {item.sub && (
                              <p className="text-xs text-muted-foreground">{item.sub}</p>
                            )}
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-accent" />
                        </button>
                      </li>
                    ))}
                </ul>

                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-[10px] tracking-luxe uppercase text-muted-foreground mb-2">
                    Quick Links
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["New Arrivals", "Bestsellers", "Sale", "Sustainable"].map(
                      (q) => (
                        <button
                          key={q}
                          onClick={() => goToSubcategory(activeCategory)}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-muted hover:bg-accent/15 hover:text-accent transition-colors"
                        >
                          {q}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Featured image */}
              {megaMenuData[activeCategory].feature && (
                <button
                  onClick={() => goToSubcategory(activeCategory)}
                  className="relative overflow-hidden group"
                >
                  <img
                    src={megaMenuData[activeCategory].feature!.image}
                    alt={megaMenuData[activeCategory].feature!.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white text-left">
                    <p className="text-[9px] tracking-luxe uppercase text-white/70 mb-1">
                      Featured
                    </p>
                    <p className="font-serif text-lg leading-tight">
                      {megaMenuData[activeCategory].feature!.title}
                    </p>
                    <p className="text-xs text-white/80 mt-1">
                      {megaMenuData[activeCategory].feature!.desc}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs mt-3 border-b border-white/40 pb-0.5 group-hover:gap-2.5 transition-all">
                      Shop Now <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
