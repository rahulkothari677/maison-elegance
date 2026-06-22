"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  Check,
  ArrowRight,
  Ruler,
  Minus,
  Plus,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { getProductById } from "@/lib/data";
import type { SizeOption } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function QuickView() {
  const {
    quickViewProductId,
    setQuickViewProduct,
  } = useStore();

  const product = quickViewProductId ? getProductById(quickViewProductId) : null;

  // Lock body scroll
  useEffect(() => {
    if (quickViewProductId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [quickViewProductId]);

  return (
    <AnimatePresence>
      {product && (
        <QuickViewContent
          key={product.id}
          product={product}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </AnimatePresence>
  );
}

function QuickViewContent({
  product,
  onClose,
}: {
  product: NonNullable<ReturnType<typeof getProductById>>;
  onClose: () => void;
}) {
  const { addToCart, toggleWishlist, wishlist, openProduct } = useStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors[0]?.name || ""
  );
  const [quantity, setQuantity] = useState(1);

  const handleClose = () => onClose();

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    toast.success("Added to bag", {
      description: `${product.name} · Size ${selectedSize} · ${selectedColor}`,
    });
    handleClose();
  };

  const handleViewFullDetails = () => {
    const id = product.id;
    handleClose();
    setTimeout(() => openProduct(id), 100);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="bg-background rounded-sm w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
            aria-label="Close quick view"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid md:grid-cols-2 gap-0">
            {/* Image gallery */}
            <div className="relative">
              <div className="aspect-[3/4] overflow-hidden bg-muted">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
              </div>
              {/* Thumbnails */}
              <div className="absolute bottom-4 left-4 right-4 flex gap-2 justify-center">
                {product.images.slice(0, 4).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "w-12 h-14 rounded-sm overflow-hidden border-2 transition-all",
                      selectedImage === i
                        ? "border-accent"
                        : "border-background/80 opacity-70 hover:opacity-100"
                    )}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="p-6 lg:p-8 flex flex-col">
              <p className="text-[10px] tracking-luxe uppercase text-accent mb-2">
                {product.brand}
              </p>
              <h2 className="font-serif text-2xl lg:text-3xl leading-tight">
                {product.name}
              </h2>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5",
                        i < Math.floor(product.rating)
                          ? "fill-accent text-accent"
                          : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {product.rating} ({product.reviewCount})
                </span>
              </div>

              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-xl font-medium">
                  ${product.price.toLocaleString()}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.compareAtPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-4 leading-relaxed line-clamp-3">
                {product.shortDescription}
              </p>

              {/* Color */}
              <div className="mt-5">
                <p className="text-[10px] tracking-wide-luxe uppercase text-muted-foreground mb-2">
                  Color: <span className="text-foreground normal-case tracking-normal">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      className={cn(
                        "relative w-8 h-8 rounded-full border-2 transition-all",
                        selectedColor === color.name
                          ? "border-accent scale-110"
                          : "border-border hover:border-accent/50"
                      )}
                      style={{ backgroundColor: color.hex }}
                    >
                      {selectedColor === color.name && (
                        <Check className="absolute inset-0 m-auto h-3 w-3 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] tracking-wide-luxe uppercase text-muted-foreground">
                    Size{selectedSize && <span className="text-foreground normal-case tracking-normal">: {selectedSize}</span>}
                  </p>
                  <button className="text-[10px] text-muted-foreground hover:text-accent inline-flex items-center gap-1">
                    <Ruler className="h-3 w-3" />
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "min-w-[42px] h-10 px-3 text-xs border transition-all",
                        selectedSize === size
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary"
                      )}
                    >
                      {size === "ONE SIZE" ? "OS" : size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity + Add */}
              <div className="flex gap-2 mt-5">
                <div className="flex items-center border border-border rounded-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-11 flex items-center justify-center hover:bg-muted"
                    aria-label="Decrease"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-11 flex items-center justify-center hover:bg-muted"
                    aria-label="Increase"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 h-11 rounded-none text-xs tracking-wide-luxe uppercase"
                >
                  <ShoppingBag className="h-3.5 w-3.5 mr-2" />
                  Add to Bag
                </Button>
                <Button
                  onClick={() => toggleWishlist(product.id)}
                  variant="outline"
                  className="h-11 w-11 rounded-none p-0"
                  aria-label="Wishlist"
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      wishlist.includes(product.id) && "fill-accent text-accent"
                    )}
                  />
                </Button>
              </div>

              <button
                onClick={handleViewFullDetails}
                className="mt-4 text-xs text-accent hover:underline inline-flex items-center gap-1 self-start"
              >
                View Full Details
                <ArrowRight className="h-3 w-3" />
              </button>

              {/* Quick features */}
              <div className="mt-auto pt-5 border-t border-border">
                <p className="text-[10px] tracking-wide-luxe uppercase text-muted-foreground mb-2">
                  Highlights
                </p>
                <ul className="space-y-1">
                  {product.features.slice(0, 3).map((f) => (
                    <li
                      key={f}
                      className="text-xs text-muted-foreground flex items-start gap-1.5"
                    >
                      <Check className="h-3 w-3 text-accent mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
