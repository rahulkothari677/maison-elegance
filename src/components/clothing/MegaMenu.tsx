"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Home, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { categories as flatCategories } from "@/lib/data";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  image: string | null;
  description: string | null;
  children: Category[];
};

// Fallback categories from static data — used when API fails (e.g. DB not seeded)
const FALLBACK_TREE: Category[] = flatCategories
  .filter((c) => c !== "All")
  .map((c, i) => ({
    id: `fallback-${c}`,
    name: c,
    slug: c.toLowerCase(),
    parentId: null,
    image: null,
    description: `Premium ${c.toLowerCase()} collection`,
    children: [],
  }));

export function MegaMenu() {
  const { setView } = useStore();
  const [tree, setTree] = useState<Category[]>(FALLBACK_TREE);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch categories on mount — with fallback
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => {
        if (!r.ok) throw new Error("API failed");
        return r.json();
      })
      .then((data) => {
        if (data.tree && data.tree.length > 0) {
          setTree(data.tree);
        }
        // else keep using FALLBACK_TREE already set as initial state
      })
      .catch(() => {
        // API failed — keep using FALLBACK_TREE (already in state)
        console.log("MegaMenu: using fallback categories (API unavailable)");
      });
  }, []);

  const handleItemEnter = (slug: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveCategory(slug);
    setSelectedSub(null);
  };

  const handlePopupEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
      setSelectedSub(null);
    }, 200);
  };

  const goToCategory = (slug: string) => {
    useStore.getState().setCategory(slug);
    useStore.getState().setView("shop");
    setActiveCategory(null);
    setSelectedSub(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const activeCat = tree.find((c) => c.slug === activeCategory);

  return (
    <nav
      className="hidden lg:flex items-center gap-6 relative"
      onMouseLeave={handleLeave}
    >
      {/* Home button */}
      <button
        onClick={() => {
          useStore.getState().setView("home");
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        className="relative text-[12px] tracking-wide-luxe uppercase py-1 transition-colors hover:text-accent inline-flex items-center gap-1.5"
        aria-label="Home"
      >
        <Home className="h-[14px] w-[14px]" />
        <span className="hidden xl:inline">Home</span>
      </button>

      {tree.map((cat) => {
        const isActive = activeCategory === cat.slug;
        return (
          <div
            key={cat.id}
            onMouseEnter={() => handleItemEnter(cat.slug)}
            className="relative"
          >
            <button
              onClick={() => goToCategory(cat.slug)}
              className={cn(
                "relative text-[12px] tracking-wide-luxe uppercase py-1 transition-colors hover:text-accent",
                isActive && "text-accent"
              )}
            >
              {cat.name}
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

      {/* Community link */}
      <button
        onClick={() => {
          useStore.getState().setView("community");
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        className="relative text-[12px] tracking-wide-luxe uppercase py-1 transition-colors hover:text-accent inline-flex items-center gap-1.5"
      >
        <span className="text-accent">✦</span>
        Community
      </button>

      <AnimatePresence>
        {activeCat && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={handlePopupEnter}
            onMouseLeave={handleLeave}
            className="absolute top-full left-0 pt-2 z-50"
          >
            <div className="w-[820px] max-w-[calc(100vw-2rem)] bg-background border border-border shadow-2xl rounded-sm overflow-hidden">
              <div className="grid grid-cols-[200px_1fr_280px] gap-0">
                {/* Left: subcategories list */}
                <div className="border-r border-border bg-secondary/20 py-3">
                  <p className="text-[10px] tracking-luxe uppercase text-accent px-5 mb-2">
                    {activeCat.name}
                  </p>
                  {activeCat.children.length === 0 ? (
                    <p className="text-xs text-muted-foreground px-5 py-2">
                      No subcategories
                    </p>
                  ) : (
                    activeCat.children.map((sub) => (
                      <button
                        key={sub.id}
                        onMouseEnter={() => setSelectedSub(sub.slug)}
                        onClick={() => goToCategory(sub.slug)}
                        className={cn(
                          "w-full flex items-center justify-between px-5 py-2 text-left text-sm hover:bg-accent/10 hover:text-accent transition-colors group",
                          selectedSub === sub.slug &&
                            "bg-accent/10 text-accent font-medium"
                        )}
                      >
                        <span>{sub.name}</span>
                        <ChevronRight className="h-3 w-3 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))
                  )}
                  <div className="border-t border-border mt-2 pt-2">
                    <button
                      onClick={() => goToCategory(activeCat.slug)}
                      className="w-full flex items-center justify-between px-5 py-2 text-left text-xs tracking-wide-luxe uppercase text-accent hover:bg-accent/10 transition-colors"
                    >
                      <span>View All {activeCat.name}</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Middle: sub-subcategories of hovered sub */}
                <div className="p-6">
                  {(() => {
                    const sub = activeCat.children.find(
                      (s) => s.slug === selectedSub
                    );
                    if (!sub) {
                      // Show first sub by default
                      const first = activeCat.children[0];
                      if (!first)
                        return (
                          <p className="text-sm text-muted-foreground">
                            Select a category on the left.
                          </p>
                        );
                      return (
                        <>
                          <p className="text-[10px] tracking-luxe uppercase text-accent mb-4">
                            {first.name}
                          </p>
                          <ul className="space-y-1">
                            {first.children.length === 0 ? (
                              <li className="text-sm text-muted-foreground">
                                Browse all {first.name.toLowerCase()} →
                              </li>
                            ) : (
                              first.children.map((subsub) => (
                                <li key={subsub.id}>
                                  <button
                                    onClick={() => goToCategory(subsub.slug)}
                                    className="group w-full flex items-center justify-between py-1.5 text-left hover:text-accent transition-colors"
                                  >
                                    <span className="text-sm">{subsub.name}</span>
                                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-accent" />
                                  </button>
                                </li>
                              ))
                            )}
                          </ul>
                        </>
                      );
                    }
                    return (
                      <>
                        <p className="text-[10px] tracking-luxe uppercase text-accent mb-4">
                          {sub.name}
                        </p>
                        <ul className="space-y-1">
                          {sub.children.length === 0 ? (
                            <li className="text-sm text-muted-foreground">
                              Browse all {sub.name.toLowerCase()} →
                            </li>
                          ) : (
                            sub.children.map((subsub) => (
                              <li key={subsub.id}>
                                <button
                                  onClick={() => goToCategory(subsub.slug)}
                                  className="group w-full flex items-center justify-between py-1.5 text-left hover:text-accent transition-colors"
                                >
                                  <span className="text-sm">{subsub.name}</span>
                                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-accent" />
                                </button>
                              </li>
                            ))
                          )}
                        </ul>
                        <button
                          onClick={() => goToCategory(sub.slug)}
                          className="mt-4 text-xs text-accent hover:underline inline-flex items-center gap-1"
                        >
                          View all {sub.name}
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </>
                    );
                  })()}
                </div>

                {/* Right: featured image */}
                {activeCat.image && (
                  <button
                    onClick={() => goToCategory(activeCat.slug)}
                    className="relative overflow-hidden group border-l border-border"
                  >
                    <img
                      src={activeCat.image}
                      alt={activeCat.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                      <p className="text-[9px] tracking-luxe uppercase text-white/70 mb-1">
                        Featured
                      </p>
                      <p className="font-serif text-xl leading-tight">
                        {activeCat.name} Collection
                      </p>
                      {activeCat.description && (
                        <p className="text-xs text-white/80 mt-1">
                          {activeCat.description}
                        </p>
                      )}
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
