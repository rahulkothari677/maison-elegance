"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  Truck,
  RefreshCw,
  Shield,
  Award,
  ChevronRight,
  Minus,
  Plus,
  Check,
  Ruler,
  Leaf,
  MapPin,
  Sparkles,
  Star,
  Search,
  Bell,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useCurrency } from "@/lib/use-currency";
import { playSound } from "@/lib/sound";
import { getProductById, products } from "@/lib/data";
import type { SizeOption } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "./ProductCard";
import { ProductReviews } from "./ProductReviews";
import { ProductQnA } from "./ProductQnA";
import { SizeFinder } from "./SizeFinder";
import { StickyAddToBar, StockCounter, LocationAvailability } from "./UXEnhancements";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ProductView() {
  const {
    selectedProductId,
    wishlist,
    toggleWishlist,
    addToCart,
    setView,
    openProduct,
  } = useStore();
  const { convert, currency } = useCurrency();

  const product = selectedProductId ? getProductById(selectedProductId) : null;
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(
    product?.colors[0]?.name || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  if (!product) {
    return (
      <div className="text-center py-32">
        <p className="font-serif text-2xl">Product not found</p>
        <Button onClick={() => setView("shop")} className="mt-6 rounded-none">
          Back to Shop
        </Button>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  // "Complete the Look" — pick coordinating items from OTHER categories
  // e.g. if viewing a coat, suggest trousers + shoes + bag
  const completeTheLook = products
    .filter(
      (p) =>
        p.id !== product.id &&
        p.category !== product.category &&
        // pick items that visually pair well — different categories, premium price tier
        p.price <= product.price * 1.5
    )
    .sort(() => 0.5 - Math.random()) // shuffle for variety
    .slice(0, 3);
  const lookTotal = completeTheLook.reduce((sum, p) => sum + p.price, 0) + product.price;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      toast.error("Please select a size");
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    playSound("add-to-cart");
    toast.success("Added to bag", {
      description: `${product.name} · Size ${selectedSize} · ${selectedColor}`,
    });
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError(true);
      toast.error("Please select a size");
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    setView("checkout");
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-xs text-muted-foreground mb-8"
      >
        <button onClick={() => setView("home")} className="hover:text-accent">
          Home
        </button>
        <ChevronRight className="h-3 w-3" />
        <button
          onClick={() => setView("shop")}
          className="hover:text-accent"
        >
          Shop
        </button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{product.name}</span>
      </motion.nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
        {/* IMAGE GALLERY */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible no-scrollbar">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "shrink-0 w-20 h-24 md:w-24 md:h-28 rounded-sm overflow-hidden border-2 transition-all",
                  selectedImage === i
                    ? "border-accent"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img
                  src={img}
                  alt={`${product.name} view ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Main image with zoom */}
          <ZoomableImage
            src={product.images[selectedImage]}
            alt={product.name}
            badge={product.badge}
          />
        </div>

        {/* PRODUCT INFO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <div>
            <p className="text-[11px] tracking-luxe uppercase text-accent mb-2">
              {product.brand}
            </p>
            <h1 className="font-serif text-3xl lg:text-4xl leading-tight text-balance">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.floor(product.rating)
                        ? "fill-accent text-accent"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} · {product.reviewCount} reviews
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-medium">
              {convert(product.price)}{" "}
              <span className="text-base text-muted-foreground font-normal">
                {currency.code}
              </span>
            </span>
            {product.compareAtPrice && (
              <>
                <span className="text-base text-muted-foreground line-through">
                  {convert(product.compareAtPrice)}
                </span>
                <Badge variant="secondary" className="bg-accent/15 text-accent border-0">
                  Save {convert(product.compareAtPrice - product.price)}
                </Badge>
              </>
            )}
          </div>

          {/* Buy Now, Pay Later */}
          {product.price >= 100 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/40 px-3 py-2 rounded-sm">
              <span className="font-medium text-foreground">
                {convert(product.price / 4)} × 4 interest-free
              </span>
              <span className="text-muted-foreground/60">·</span>
              <span>with</span>
              <span className="font-semibold tracking-wide">Klarna</span>
              <span className="text-muted-foreground/40">|</span>
              <span className="font-semibold tracking-wide">Afterpay</span>
            </div>
          )}

          <p className="text-muted-foreground leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Color selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-[11px] tracking-wide-luxe uppercase">
                Color: <span className="text-foreground normal-case tracking-normal">{selectedColor}</span>
              </Label>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  title={color.name}
                  className={cn(
                    "relative w-10 h-10 rounded-full border-2 transition-all",
                    selectedColor === color.name
                      ? "border-accent scale-110"
                      : "border-border hover:border-accent/50"
                  )}
                  style={{ backgroundColor: color.hex }}
                >
                  {selectedColor === color.name && (
                    <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-[11px] tracking-wide-luxe uppercase">
                Size {selectedSize && <span className="text-foreground normal-case tracking-normal">: {selectedSize}</span>}
              </Label>
              <div className="flex items-center gap-3">
                <SizeFinder
                  sizes={product.sizes}
                  onPick={(s) => {
                    setSelectedSize(s);
                    setSizeError(false);
                    toast.success(`Size ${s} selected`, {
                      description: "Based on your Size Finder input",
                    });
                  }}
                />
                <span className="text-muted-foreground/40">·</span>
                <button className="text-xs text-muted-foreground hover:text-accent inline-flex items-center gap-1">
                  <Ruler className="h-3.5 w-3.5" />
                  Size Guide
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size);
                    setSizeError(false);
                  }}
                  className={cn(
                    "min-w-[52px] h-12 px-4 text-sm border transition-all",
                    selectedSize === size
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary",
                    sizeError && "border-destructive"
                  )}
                >
                  {size === "ONE SIZE" ? "ONE SIZE" : size}
                </button>
              ))}
            </div>
            {sizeError && (
              <p className="text-xs text-destructive mt-2">
                Please select a size to continue
              </p>
            )}
          </div>

          {/* Quantity + Add to cart OR Notify Me (when out of stock) */}
          {product.inStock === 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 px-4 py-3 rounded-sm">
                <span className="w-2 h-2 bg-destructive rounded-full" />
                <span className="font-medium">Out of Stock</span>
              </div>
              <Button
                onClick={() => {
                  toast.success("We'll notify you when this is back in stock!", {
                    description: "You'll get an email as soon as it's available.",
                  });
                }}
                className="w-full h-12 rounded-none text-sm tracking-wide-luxe uppercase"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notify Me When Available
              </Button>
              <Button
                onClick={() => toggleWishlist(product.id)}
                variant="outline"
                className="w-full h-11 rounded-none text-sm tracking-wide-luxe uppercase"
              >
                <Heart
                  className={cn("h-4 w-4 mr-2", isWishlisted && "fill-accent text-accent")}
                />
                Save to Wishlist
              </Button>
            </div>
          ) : (
            <>
              <div className="flex gap-3">
                <div className="flex items-center border border-border rounded-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 rounded-none text-sm tracking-wide-luxe uppercase"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Add to Bag
                </Button>
                <Button
                  onClick={() => toggleWishlist(product.id)}
                  variant="outline"
                  className="h-12 w-12 rounded-none p-0"
                  aria-label="Toggle wishlist"
                >
                  <Heart
                    className={cn("h-5 w-5", isWishlisted && "fill-accent text-accent")}
                  />
                </Button>
              </div>

              <Button
                onClick={handleBuyNow}
                variant="outline"
                className="w-full h-12 rounded-none text-sm tracking-wide-luxe uppercase border-2"
              >
                Buy Now
              </Button>
            </>
          )}

          {/* Estimated delivery + Stock alert */}
          {(() => {
            // Calculate estimated delivery date (3-5 business days from now)
            const now = new Date();
            const minDate = new Date(now);
            const maxDate = new Date(now);
            let minDays = 0;
            let maxDays = 0;
            while (minDays < 3) {
              minDate.setDate(minDate.getDate() + 1);
              if (minDate.getDay() !== 0 && minDate.getDay() !== 6) minDays++;
            }
            while (maxDays < 5) {
              maxDate.setDate(maxDate.getDate() + 1);
              if (maxDate.getDay() !== 0 && maxDate.getDay() !== 6) maxDays++;
            }
            const fmt = (d: Date) =>
              d.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm bg-secondary/40 px-4 py-2.5 rounded-sm">
                  <Truck className="h-4 w-4 text-accent shrink-0" />
                  <span>
                    <span className="text-muted-foreground">Estimated delivery: </span>
                    <span className="font-medium">
                      {fmt(minDate)} – {fmt(maxDate)}
                    </span>
                  </span>
                </div>
                <LocationAvailability />
                <StockCounter inStock={product.inStock} />
              </div>
            );
          })()}

          {/* Service icons */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
            {[
              { icon: Truck, text: "Free shipping over $250" },
              { icon: RefreshCw, text: "30-day free returns" },
              { icon: Shield, text: "Lifetime repairs" },
              { icon: Award, text: "Authenticity guaranteed" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-sm">
                <item.icon className="h-4 w-4 text-accent shrink-0" />
                <span className="text-muted-foreground">{item.text}</span>
              </div>
            ))}
          </div>

          {/* SKU */}
          <p className="text-xs text-muted-foreground pt-2">
            SKU: {product.sku}
          </p>
        </motion.div>
      </div>

      {/* DETAILS TABS */}
      <div className="mt-20 lg:mt-28">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="bg-transparent border-b border-border rounded-none w-full h-auto p-0 justify-start overflow-x-auto no-scrollbar">
            {[
              ["description", "Description"],
              ["materials", "Materials"],
              ["craft", "Craftsmanship"],
              ["care", "Care"],
              ["sustainability", "Sustainability"],
              ["reviews", `Reviews (${product.reviewCount})`],
              ["qna", "Q&A"],
            ].map(([val, label]) => (
              <TabsTrigger
                key={val}
                value={val}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6 py-4 text-sm tracking-wide-luxe uppercase data-[state=active]:text-accent"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="description" className="mt-10">
            <div className="grid lg:grid-cols-[2fr_1fr] gap-12">
              <div className="space-y-6">
                <p className="text-lg leading-relaxed text-pretty">
                  {product.description}
                </p>
                <div>
                  <h3 className="font-serif text-xl mb-4">Key Features</h3>
                  <ul className="space-y-2.5">
                    {product.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-accent mt-1 shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-secondary/30 p-6 rounded-sm space-y-4">
                <div>
                  <p className="text-[11px] tracking-wide-luxe uppercase text-muted-foreground mb-1">
                    Fit
                  </p>
                  <p className="text-sm leading-relaxed">{product.fit}</p>
                </div>
                <div className="h-px bg-border" />
                <div>
                  <p className="text-[11px] tracking-wide-luxe uppercase text-muted-foreground mb-1">
                    Origin
                  </p>
                  <p className="text-sm flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    {product.origin}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="materials" className="mt-10">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h3 className="font-serif text-2xl mb-6">Materials & Construction</h3>
                <div className="space-y-4">
                  {product.materials.map((m) => (
                    <div
                      key={m.label}
                      className="flex justify-between items-start py-3 border-b border-border"
                    >
                      <span className="text-[11px] tracking-wide-luxe uppercase text-muted-foreground">
                        {m.label}
                      </span>
                      <span className="text-sm text-right max-w-[60%]">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-secondary/30 p-8 rounded-sm">
                <Award className="h-8 w-8 text-accent mb-4" />
                <h4 className="font-serif text-lg mb-3">
                  The difference is in the materials
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We source exclusively from mills that have been perfecting
                  their craft for generations. Every fabric, leather, and
                  component is traceable to its origin — because what touches
                  your skin matters.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="craft" className="mt-10">
            <div className="grid lg:grid-cols-[1fr_1fr] gap-12 items-start">
              <div>
                <h3 className="font-serif text-2xl mb-6">Master Craftsmanship</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {product.craftsmanship}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Hand-stitched", "Construction details that machines can't replicate"],
                  ["Single tailor", "One artisan owns your piece from start to finish"],
                  ["Time-honored", "Techniques passed through generations"],
                  ["Inspectable", "Every detail visible, every stitch deliberate"],
                ].map(([title, desc]) => (
                  <div key={title} className="bg-secondary/30 p-5 rounded-sm">
                    <p className="font-medium text-sm mb-1.5">{title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="care" className="mt-10 max-w-3xl">
            <h3 className="font-serif text-2xl mb-6">Care Instructions</h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {product.care}
            </p>
            <div className="mt-8 bg-accent/5 border border-accent/20 p-6 rounded-sm">
              <p className="text-sm flex items-start gap-3">
                <Shield className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span>
                  <strong className="font-medium">Lifetime Repairs:</strong> Every
                  MAISON ÉLÉGANCE piece is eligible for our lifetime repair
                  program. Send it back to our atelier at any time for
                  complimentary repairs — you only pay shipping.
                </span>
              </p>
            </div>
          </TabsContent>

          <TabsContent value="sustainability" className="mt-10 max-w-3xl">
            <div className="flex items-start gap-4 mb-6">
              <Leaf className="h-10 w-10 text-accent shrink-0" />
              <div>
                <h3 className="font-serif text-2xl mb-2">Sustainability</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {product.sustainability}
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              {[
                ["Traceable", "100% of materials traceable to source"],
                ["Certified", "Industry-leading certifications"],
                ["Built to Last", "Designed to outlast fast fashion by 30x"],
              ].map(([title, desc]) => (
                <div key={title} className="border border-border p-5 rounded-sm">
                  <p className="font-serif text-lg mb-1">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-10">
            <ProductReviews slug={product.id} />
          </TabsContent>

          <TabsContent value="qna" className="mt-10">
            <ProductQnA slug={product.id} />
          </TabsContent>
        </Tabs>
      </div>

      {/* COMPLETE THE LOOK */}
      {completeTheLook.length > 0 && (
        <div className="mt-24">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <p className="text-[11px] tracking-luxe uppercase text-accent mb-2">
                Curated by our stylists
              </p>
              <h2 className="font-serif text-3xl lg:text-4xl">Complete the Look</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Pieces that pair perfectly with the {product.name.split(" ").slice(-2).join(" ")}.
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] tracking-wide-luxe uppercase text-muted-foreground">
                Complete look total
              </p>
              <p className="font-serif text-2xl">${lookTotal.toLocaleString()}</p>
              {(() => {
                const bundleDiscount = Math.round(lookTotal * 0.1);
                const bundlePrice = lookTotal - bundleDiscount;
                return (
                  <p className="text-xs text-accent mt-1">
                    Buy together: <span className="font-medium">${bundlePrice.toLocaleString()}</span> (save ${bundleDiscount})
                  </p>
                );
              })()}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 sm:gap-x-6">
            {/* The current product (first card) */}
            <div className="relative">
              <div className="aspect-[3/4] overflow-hidden rounded-sm bg-muted mb-3">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[10px] tracking-luxe uppercase text-accent">This piece</p>
              <p className="font-serif text-sm line-clamp-1">{product.name}</p>
              <p className="text-sm font-medium mt-1">${product.price.toLocaleString()}</p>
            </div>
            {completeTheLook.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              className="rounded-none h-11 px-6 text-sm tracking-wide-luxe uppercase"
              onClick={() => {
                // Add all coordinating items to cart
                completeTheLook.forEach((p) => {
                  addToCart(p, p.sizes[0], p.colors[0].name, 1);
                });
                toast.success(`Added ${completeTheLook.length} pieces to your bag`, {
                  description: `Complete the look — $${lookTotal.toLocaleString()}`,
                });
              }}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Add All to Bag · ${lookTotal.toLocaleString()}
            </Button>
          </div>
        </div>
      )}

      {/* RELATED */}
      {related.length > 0 && (
        <div className="mt-24">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-serif text-3xl lg:text-4xl">You May Also Like</h2>
            <Button
              variant="link"
              onClick={() => setView("shop")}
              className="text-sm tracking-wide-luxe uppercase hover:text-accent"
            >
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Add-to-Bar (mobile only) */}
      <StickyAddToBar product={product} onAddToCart={handleAddToCart} />
    </div>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={cn("block text-sm font-medium", className)}>{children}</label>;
}

// Zoomable image with hover lens effect
function ZoomableImage({
  src,
  alt,
  badge,
}: {
  src: string;
  alt: string;
  badge?: string;
}) {
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 relative aspect-[3/4] overflow-hidden rounded-sm bg-muted cursor-zoom-in group"
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={handleMove}
    >
      <motion.img
        key={src}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-200"
        style={{
          transformOrigin: `${pos.x}% ${pos.y}%`,
          transform: zoom ? "scale(2)" : "scale(1)",
        }}
      />
      {badge && (
        <div className="absolute top-4 left-4 pointer-events-none">
          <span className="bg-background/95 backdrop-blur text-foreground text-[10px] tracking-wide-luxe uppercase px-3 py-1.5 font-medium">
            {badge}
          </span>
        </div>
      )}
      {/* Zoom hint */}
      <div
        className={cn(
          "absolute bottom-4 right-4 bg-background/90 backdrop-blur text-foreground text-[10px] tracking-wide-luxe uppercase px-3 py-1.5 flex items-center gap-1.5 transition-opacity pointer-events-none",
          zoom ? "opacity-0" : "opacity-100 group-hover:opacity-0"
        )}
      >
        <Search className="h-3 w-3" />
        Hover to Zoom
      </div>
    </div>
  );
}
