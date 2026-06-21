"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, Check } from "lucide-react";
import { products, categories, sortOptions } from "@/lib/data";
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
  new Set(products.flatMap((p) => p.colors.map((c) => c.name)))
).slice(0, 12);

export function ShopView() {
  const { selectedCategory, setCategory } = useStore();
  const [sortBy, setSortBy] = useState<string>("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

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

  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
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

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort((a, b) =>
          (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0)
        );
        break;
    }

    return result;
  }, [selectedCategory, selectedSizes, selectedColors, priceRange, sortBy]);

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
            <span>${priceRange[1]}{priceRange[1] === 1500 ? "+" : ""}</span>
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
            const product = products.find((p) =>
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
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 lg:mb-14"
      >
        <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
          The Collection
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl">
          {selectedCategory === "All" ? "All Pieces" : selectedCategory}
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          {selectedCategory === "All"
            ? "Browse our full collection of handcrafted premium apparel and accessories."
            : `Discover our ${selectedCategory.toLowerCase()} collection — each piece handcrafted by master artisans in Europe.`}
        </p>
      </motion.div>

      {/* Category pills */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "px-5 h-10 text-sm tracking-wide whitespace-nowrap border transition-all rounded-full",
              selectedCategory === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-primary text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

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
                {(selectedSizes.length + selectedColors.length) > 0 && (
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
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(selectedSizes.length > 0 || selectedColors.length > 0) && (
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
          {filtered.length === 0 ? (
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
              {filtered.map((p) => (
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
