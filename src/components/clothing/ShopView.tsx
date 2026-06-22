"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, Check, ChevronRight, Loader2, Home } from "lucide-react";
import { products as localProducts, sortOptions } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ProductCard } from "./ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const allSizes = ["XS", "S", "M", "L", "XL", "XXL", "ONE SIZE"];
const allColors = Array.from(
  new Set(localProducts.flatMap((p) => p.colors.map((c) => c.name)))
).slice(0, 12);

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: Category[];
};

export function ShopView() {
  const { selectedCategory, setCategory, setView } = useStore();
  const [sortBy, setSortBy] = useState<string>("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  // Server-side data
  const [apiProducts, setApiProducts] = useState<any[] | null>(null);
  const [categoryTree, setCategoryTree] = useState<Category[]>(
    // Fallback: flat categories from static data
    localProducts
      ? Array.from(
          new Set(localProducts.map((p) => p.category))
        )
          .filter((c) => c !== "All")
          .map((c, i) => ({
            id: `fb-${c}`,
            name: c,
            slug: c.toLowerCase(),
            parentId: null,
            children: [],
          }))
      : []
  );
  const [crumbs, setCrumbs] = useState<Category[]>([]); // breadcrumb path
  const [activeSubs, setActiveSubs] = useState<Category[]>([]); // siblings at sub level

  // Fetch category tree on mount — with fallback
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => {
        if (!r.ok) throw new Error("API failed");
        return r.json();
      })
      .then((data) => {
        if (data.tree && data.tree.length > 0) {
          setCategoryTree(data.tree);
        }
      })
      .catch(() => {
        // API failed — keep using fallback categories
      });
  }, []);

  // Fetch products from API whenever filters change — with fallback to local data
  useEffect(() => {
    Promise.resolve().then(() => setApiProducts(null)); // show skeleton
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== "all") {
      params.set("categorySlug", selectedCategory);
    }
    params.set("sort", sortBy);
    if (priceRange[0] > 0) params.set("minPrice", String(priceRange[0]));
    if (priceRange[1] < 1500) params.set("maxPrice", String(priceRange[1]));
    if (selectedSizes.length > 0) params.set("sizes", selectedSizes.join(","));
    if (selectedColors.length > 0)
      params.set("colors", selectedColors.join(","));

    fetch(`/api/products?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error("API failed");
        return r.json();
      })
      .then((data) => {
        // Always trust the API result — even if it's an empty array.
        // Only fall back to local static products if the API itself failed
        // (caught in .catch below). This way admin-added products show up
        // correctly, and an empty filter result shows "No products found"
        // instead of silently swapping in demo data.
        if (Array.isArray(data.products)) {
          setApiProducts(data.products);
        } else {
          setApiProducts([]);
        }
      })
      .catch(() => {
        // API failed entirely — use local product data as fallback so the
        // page still works in dev / preview environments without DB
        console.log("ShopView: API unavailable, using fallback local products");
        let result = [...localProducts];
        if (selectedCategory && selectedCategory !== "all") {
          const catName = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
          result = result.filter(
            (p) =>
              p.category.toLowerCase() === selectedCategory.toLowerCase() ||
              p.category === catName
          );
        }
        if (selectedSizes.length > 0) {
          result = result.filter((p) =>
            p.sizes.some((s) => selectedSizes.includes(s))
          );
        }
        if (selectedColors.length > 0) {
          result = result.filter((p) =>
            p.colors.some((c) => selectedColors.includes(c.name))
          );
        }
        result = result.filter(
          (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
        );
        setApiProducts(result);
      });
  }, [selectedCategory, sortBy, priceRange, selectedSizes, selectedColors]);

  // Compute breadcrumb path for selectedCategory
  useEffect(() => {
    if (!selectedCategory || selectedCategory === "all") {
      Promise.resolve().then(() => {
        setCrumbs([]);
        setActiveSubs([]);
      });
      return;
    }
    // Walk the tree to find the path
    const path: Category[] = [];
    let activeSubs: Category[] = [];
    const walk = (cats: Category[], current: Category[]): boolean => {
      for (const c of cats) {
        const newPath = [...current, c];
        if (c.slug === selectedCategory) {
          path.push(...newPath);
          // Sub-siblings: if depth 1, siblings are top-level; if depth 2+, siblings are parent's children
          if (newPath.length >= 2) {
            const parent = newPath[newPath.length - 2];
            activeSubs = parent.children;
          } else {
            activeSubs = c.children;
          }
          return true;
        }
        if (walk(c.children, newPath)) return true;
      }
      return false;
    };
    walk(categoryTree, []);
    Promise.resolve().then(() => {
      setCrumbs(path);
      setActiveSubs(activeSubs);
    });
  }, [selectedCategory, categoryTree]);

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );

  const toggleColor = (color: string) =>
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 1500]);
  };

  // Display name for the current category
  const currentCatName =
    crumbs.length > 0 ? crumbs[crumbs.length - 1].name : "All Pieces";
  const currentCatDescription =
    crumbs.length > 0 && crumbs[crumbs.length - 1].description
      ? crumbs[crumbs.length - 1].description
      : selectedCategory === "all" || !selectedCategory
      ? "Browse our full collection of handcrafted premium apparel and accessories."
      : `Discover our ${currentCatName.toLowerCase()} collection — each piece handcrafted by master artisans in Europe.`;

  const renderFilters = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
          Clear All
        </Button>
      </div>

      {/* Price */}
      <div>
        <Label className="text-[11px] tracking-wide-luxe uppercase mb-4 block">
          Price Range
        </Label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(v) => setPriceRange(v as [number, number])}
            min={0}
            max={1500}
            step={50}
            className="my-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>
              ${priceRange[1]}
              {priceRange[1] === 1500 ? "+" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Size */}
      <div>
        <Label className="text-[11px] tracking-wide-luxe uppercase mb-4 block">
          Size
        </Label>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={cn(
                "min-w-[44px] h-10 px-3 text-sm border rounded-sm transition-all",
                selectedSizes.includes(size)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary"
              )}
            >
              {size === "ONE SIZE" ? "OS" : size}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <Label className="text-[11px] tracking-wide-luxe uppercase mb-4 block">
          Color
        </Label>
        <div className="flex flex-wrap gap-2">
          {allColors.map((color) => {
            const product = localProducts.find((p) =>
              p.colors.some((c) => c.name === color)
            );
            const colorObj = product?.colors.find((c) => c.name === color);
            const isSelected = selectedColors.includes(color);
            return (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                title={color}
                className={cn(
                  "relative w-9 h-9 rounded-full border-2 transition-all",
                  isSelected
                    ? "border-primary scale-110"
                    : "border-border hover:border-primary/50"
                )}
                style={{ backgroundColor: colorObj?.hex }}
              >
                {isSelected && (
                  <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-md" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
      {/* Breadcrumbs */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap"
      >
        <button
          onClick={() => {
            setCategory("all");
            setView("home");
          }}
          className="hover:text-accent inline-flex items-center gap-1"
        >
          <Home className="h-3 w-3" />
          Home
        </button>
        <ChevronRight className="h-3 w-3" />
        <button
          onClick={() => setCategory("all")}
          className={cn(
            "hover:text-accent",
            (!selectedCategory || selectedCategory === "all") &&
              "text-foreground font-medium"
          )}
        >
          Shop
        </button>
        {crumbs.map((c, i) => (
          <div key={c.id} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3" />
            <button
              onClick={() => setCategory(c.slug)}
              className={cn(
                "hover:text-accent",
                i === crumbs.length - 1 && "text-foreground font-medium"
              )}
            >
              {c.name}
            </button>
          </div>
        ))}
      </motion.nav>

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 lg:mb-14"
      >
        <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
          The Collection
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl">{currentCatName}</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          {currentCatDescription}
        </p>
      </motion.div>

      {/* Subcategory pills (if applicable) */}
      {activeSubs.length > 0 && (
        <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => {
              // Go to parent
              if (crumbs.length >= 2) {
                setCategory(crumbs[crumbs.length - 2].slug);
              } else {
                setCategory("all");
              }
            }}
            className={cn(
              "px-4 h-10 text-sm tracking-wide whitespace-nowrap border transition-all rounded-full",
              "border-border hover:border-primary text-foreground"
            )}
          >
            All
          </button>
          {activeSubs.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setCategory(sub.slug)}
              className={cn(
                "px-4 h-10 text-sm tracking-wide whitespace-nowrap border transition-all rounded-full",
                selectedCategory === sub.slug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary text-foreground"
              )}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Top-level category pills (when no category selected) */}
      {(!selectedCategory || selectedCategory === "all") &&
        categoryTree.length > 0 && (
          <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-1">
            {categoryTree.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.slug)}
                className="px-4 h-10 text-sm tracking-wide whitespace-nowrap border border-border hover:border-primary text-foreground transition-all rounded-full"
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden rounded-sm"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {selectedSizes.length + selectedColors.length > 0 && (
                  <span className="ml-2 bg-accent text-accent-foreground text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                    {selectedSizes.length + selectedColors.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[340px] overflow-y-auto p-6">
              {renderFilters()}
            </SheetContent>
          </Sheet>

          <p className="text-sm text-muted-foreground">
            {apiProducts === null ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading...
              </span>
            ) : (
              <>
                {apiProducts.length}{" "}
                {apiProducts.length === 1 ? "piece" : "pieces"}
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedSizes.length + selectedColors.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs hidden md:flex"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear Filters
            </Button>
          )}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] h-10 rounded-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block sticky top-32 h-fit">
          {renderFilters()}
        </aside>

        {/* Products grid */}
        <div>
          {apiProducts === null ? (
            <ShopSkeleton />
          ) : apiProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-serif text-2xl mb-3">No pieces found</p>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters to discover more.
              </p>
              <Button onClick={clearFilters} className="rounded-none">
                Clear Filters
              </Button>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.05 } },
              }}
              className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6"
            >
              {apiProducts.map((p: any) => (
                <motion.div
                  key={p.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function ShopSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[3/4] rounded-sm shimmer" />
          <div className="h-3 w-1/2 mt-3 rounded shimmer" />
          <div className="h-4 w-3/4 mt-2 rounded shimmer" />
          <div className="h-3 w-1/4 mt-2 rounded shimmer" />
        </div>
      ))}
    </div>
  );
}
