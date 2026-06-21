"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  GitCompare,
  Trash2,
  Check,
  ArrowRight,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { getProductById } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CompareTray() {
  const { compareIds, toggleCompare, clearCompare, compareOpen, setCompareOpen } =
    useStore();
  const [loading, setLoading] = useState(false);
  const [apiProducts, setApiProducts] = useState<Record<string, any>>({});

  // Fetch full product data for compare IDs
  useEffect(() => {
    if (compareIds.length === 0) {
      Promise.resolve().then(() => setApiProducts({}));
      return;
    }
    Promise.resolve().then(() => setLoading(true));
    Promise.all(
      compareIds.map(async (id) => {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        return [id, data.product] as const;
      })
    )
      .then((entries) => {
        setApiProducts(Object.fromEntries(entries));
      })
      .finally(() => setLoading(false));
  }, [compareIds]);

  const products = compareIds
    .map((id) => apiProducts[id])
    .filter(Boolean);

  // Show tray only when there's at least 1 item and modal isn't open
  if (compareIds.length === 0 || compareOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-background border border-border rounded-sm shadow-2xl p-4 max-w-[calc(100vw-2rem)]"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <GitCompare className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm font-medium">Compare ({compareIds.length}/4)</p>
              <button
                onClick={clearCompare}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-md">
            {compareIds.map((id) => {
              const p = apiProducts[id];
              return (
                <div key={id} className="relative shrink-0">
                  {p ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-12 h-14 object-cover rounded-sm border border-border"
                    />
                  ) : (
                    <div className="w-12 h-14 rounded-sm border border-border bg-muted flex items-center justify-center">
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  <button
                    onClick={() => toggleCompare(id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                    aria-label="Remove from compare"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>

          <Button
            onClick={() => setCompareOpen(true)}
            disabled={compareIds.length < 2}
            className="rounded-none h-10 text-xs tracking-wide-luxe uppercase shrink-0"
          >
            Compare Now
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function CompareModal() {
  const { compareIds, toggleCompare, clearCompare, compareOpen, setCompareOpen, openProduct, addToCart } =
    useStore();
  const [apiProducts, setApiProducts] = useState<Record<string, any>>({});

  useEffect(() => {
    if (compareIds.length === 0) {
      Promise.resolve().then(() => setApiProducts({}));
      return;
    }
    Promise.all(
      compareIds.map(async (id) => {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        return [id, data.product] as const;
      })
    ).then((entries) => {
      setApiProducts(Object.fromEntries(entries));
    });
  }, [compareIds, compareOpen]);

  useEffect(() => {
    if (compareOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [compareOpen]);

  const products = compareIds
    .map((id) => apiProducts[id])
    .filter(Boolean);

  if (!compareOpen) return null;

  // Comparison rows
  const rows: { label: string; get: (p: any) => React.ReactNode }[] = [
    {
      label: "Price",
      get: (p) => (
        <span className="font-serif text-lg">${p.price.toLocaleString()}</span>
      ),
    },
    {
      label: "Compare-at",
      get: (p) =>
        p.compareAtPrice ? (
          <span className="text-muted-foreground line-through">
            ${p.compareAtPrice.toLocaleString()}
          </span>
        ) : (
          "—"
        ),
    },
    { label: "Brand", get: (p) => p.brand },
    { label: "Category", get: (p) => p.category },
    { label: "Subcategory", get: (p) => p.subcategory },
    { label: "Rating", get: (p) => `★ ${p.rating} (${p.reviewCount})` },
    { label: "Origin", get: (p) => p.origin },
    { label: "Fit", get: (p) => p.fit },
    {
      label: "Materials",
      get: (p) => (
        <ul className="text-xs space-y-0.5">
          {p.materials.slice(0, 3).map((m: any, i: number) => (
            <li key={i}>
              <span className="text-muted-foreground">{m.label}:</span> {m.value}
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: "Sizes",
      get: (p) => (
        <div className="flex flex-wrap gap-1 justify-center">
          {p.sizes.map((s: string) => (
            <span
              key={s}
              className="text-xs px-2 py-0.5 border border-border rounded-sm"
            >
              {s === "ONE SIZE" ? "OS" : s}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: "Colors",
      get: (p) => (
        <div className="flex flex-wrap gap-1 justify-center">
          {p.colors.map((c: any) => (
            <span
              key={c.name}
              title={c.name}
              className="w-4 h-4 rounded-full border border-border"
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      ),
    },
    { label: "In Stock", get: (p) => `${p.inStock} units` },
    {
      label: "Key Feature",
      get: (p) => p.features[0] || "—",
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setCompareOpen(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-background rounded-sm w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <GitCompare className="h-5 w-5 text-accent" />
            <h2 className="font-serif text-xl">
              Compare {products.length} {products.length === 1 ? "piece" : "pieces"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCompare}
              className="text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Clear All
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCompareOpen(false)}
              aria-label="Close compare"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Comparison grid */}
        <div className="p-5 overflow-x-auto">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading products...</p>
            </div>
          ) : (
            <div
              className="grid gap-0 min-w-full"
              style={{
                gridTemplateColumns: `140px repeat(${products.length}, minmax(220px, 1fr))`,
              }}
            >
              {/* Header row: product image + name */}
              <div className="p-3 bg-secondary/20 sticky left-0 z-10" />
              {products.map((p) => (
                <div key={p.id} className="p-3 border-l border-border">
                  <div className="relative">
                    <button
                      onClick={() => toggleCompare(p.id)}
                      className="absolute top-0 right-0 w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted"
                      aria-label="Remove from compare"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setCompareOpen(false);
                        openProduct(p.id);
                      }}
                      className="block w-full"
                    >
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full aspect-[3/4] object-cover rounded-sm mb-2"
                      />
                      <p className="font-serif text-sm line-clamp-2 hover:text-accent transition-colors">
                        {p.name}
                      </p>
                    </button>
                  </div>
                  <Button
                    size="sm"
                    className="w-full rounded-sm mt-2 h-8 text-xs"
                    onClick={() => {
                      addToCart(p, p.sizes[0], p.colors[0].name, 1);
                      toast.success("Added to bag");
                    }}
                  >
                    <ShoppingBag className="h-3 w-3 mr-1.5" />
                    Add to Bag
                  </Button>
                </div>
              ))}

              {/* Comparison rows */}
              {rows.map((row, i) => (
                <div
                  key={row.label}
                  className={cn(
                    "contents",
                  )}
                >
                  <div
                    className={cn(
                      "p-3 text-[10px] tracking-wide-luxe uppercase text-muted-foreground sticky left-0 z-10",
                      i % 2 === 0 ? "bg-secondary/20" : "bg-background"
                    )}
                  >
                    {row.label}
                  </div>
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className={cn(
                        "p-3 text-sm border-l border-border text-center",
                        i % 2 === 0 ? "bg-secondary/10" : "bg-background"
                      )}
                    >
                      {row.get(p)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border p-4 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCompareOpen(false)}
            className="rounded-sm"
          >
            Continue Shopping
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
