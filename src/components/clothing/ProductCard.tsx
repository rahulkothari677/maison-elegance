"use client";

import { useState } from "react";
import { Heart, Eye, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/data";
import { useStore } from "@/lib/store";
import { useUserData } from "@/lib/use-user-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { openProduct, toggleWishlist: toggleLocalWishlist, wishlist: localWishlist, addToCart, setQuickViewProduct } = useStore();
  const { isAuthenticated, wishlistProductIds, toggleWishlist: toggleApiWishlist } = useUserData();
  const [imgIdx, setImgIdx] = useState(0);
  const [hovering, setHovering] = useState(false);

  // Use API wishlist if authed, else local fallback
  const isWishlisted = isAuthenticated
    ? wishlistProductIds.includes(product.id)
    : localWishlist.includes(product.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuthenticated) {
      toggleApiWishlist(product.id);
    } else {
      toggleLocalWishlist(product.id);
    }
  };

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => {
        setHovering(true);
        if (product.images.length > 1) setImgIdx(1);
      }}
      onMouseLeave={() => {
        setHovering(false);
        setImgIdx(0);
      }}
      onClick={() => openProduct(product.id)}
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted rounded-sm">
        <img
          src={product.images[imgIdx]}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
        />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3">
            <span className="bg-background/95 backdrop-blur text-foreground text-[10px] tracking-wide-luxe uppercase px-3 py-1.5 font-medium">
              {product.badge}
            </span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur flex items-center justify-center transition-all",
            isWishlisted
              ? "bg-accent text-accent-foreground"
              : "bg-background/90 text-foreground hover:bg-background"
          )}
        >
          <Heart
            className={cn("h-4 w-4", isWishlisted && "fill-current")}
          />
        </button>

        {/* Quick view button (top-left, appears on hover) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setQuickViewProduct(product.id);
          }}
          aria-label="Quick view"
          className={cn(
            "absolute top-3 left-3 w-9 h-9 rounded-full backdrop-blur flex items-center justify-center transition-all",
            "bg-background/90 text-foreground hover:bg-background",
            product.badge && "top-14",
            hovering ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 lg:opacity-0"
          )}
        >
          <Eye className="h-4 w-4" />
        </button>

        {/* Quick action bar */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center gap-2 transition-all duration-300",
            hovering
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3 lg:opacity-0"
          )}
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, product.sizes[0], product.colors[0].name, 1);
            }}
            className="bg-background hover:bg-background/90 text-foreground rounded-none font-medium tracking-wide text-xs uppercase h-9"
          >
            <ShoppingBag className="h-3.5 w-3.5 mr-2" />
            Quick Add
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product.id);
            }}
            className="bg-background hover:bg-background/90 text-foreground rounded-none h-9 w-9 p-0"
            aria-label="Quick view"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="pt-4 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] tracking-wide-luxe uppercase text-muted-foreground">
            {product.brand}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span className="text-accent">★</span>
            <span>{product.rating}</span>
            <span className="opacity-60">({product.reviewCount})</span>
          </div>
        </div>
        <h3 className="font-serif text-base leading-snug line-clamp-1 group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-sm font-medium">
            ${product.price.toLocaleString()}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-muted-foreground line-through">
              ${product.compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>
        {/* Color dots */}
        <div className="flex items-center gap-1.5 pt-1">
          {product.colors.slice(0, 5).map((c) => (
            <span
              key={c.name}
              title={c.name}
              className="w-3 h-3 rounded-full border border-border"
              style={{ backgroundColor: c.hex }}
            />
          ))}
          {product.colors.length > 5 && (
            <span className="text-[10px] text-muted-foreground">
              +{product.colors.length - 5}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
