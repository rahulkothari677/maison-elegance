"use client";

import { motion } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Tag,
  Truck,
  Shield,
  RefreshCw,
} from "lucide-react";
import { useStore, cartSubtotal } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function CartView() {
  const {
    cart,
    updateCartQty,
    removeFromCart,
    setView,
    openProduct,
  } = useStore();

  const subtotal = cartSubtotal(cart);
  const shipping = subtotal >= 250 || subtotal === 0 ? 0 : 25;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + tax;

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center mb-6">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-4xl mb-3">Your bag is empty</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Discover pieces that will become a permanent part of your wardrobe —
            crafted to last, designed to be loved.
          </p>
          <Button
            onClick={() => setView("shop")}
            className="rounded-none h-12 px-8 text-sm tracking-wide-luxe uppercase"
          >
            Browse Collection
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
          Shopping Bag
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl">Your Bag</h1>
        <p className="text-muted-foreground mt-2">
          {cart.length} {cart.length === 1 ? "item" : "items"} in your bag
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-10 lg:gap-16">
        {/* Items */}
        <div className="space-y-6">
          {cart.map((item, idx) => (
            <motion.div
              key={`${item.productId}-${item.size}-${item.color}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex gap-4 sm:gap-6 pb-6 border-b border-border"
            >
              <button
                onClick={() => openProduct(item.productId)}
                className="shrink-0"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-32 sm:w-32 sm:h-40 object-cover rounded-sm cursor-pointer hover:opacity-90 transition-opacity"
                />
              </button>

              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] tracking-luxe uppercase text-muted-foreground">
                      MAISON ÉLÉGANCE
                    </p>
                    <button
                      onClick={() => openProduct(item.productId)}
                      className="font-serif text-base sm:text-lg text-left hover:text-accent transition-colors line-clamp-2"
                    >
                      {item.name}
                    </button>
                  </div>
                  <p className="font-medium whitespace-nowrap">
                    ${(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                  <span>Color: {item.color}</span>
                  <span>Size: {item.size}</span>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4">
                  <div className="flex items-center border border-border rounded-sm">
                    <button
                      onClick={() =>
                        updateCartQty(
                          item.productId,
                          item.size,
                          item.color,
                          item.quantity - 1
                        )
                      }
                      className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateCartQty(
                          item.productId,
                          item.size,
                          item.color,
                          item.quantity + 1
                        )
                      }
                      className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors"
                      aria-label="Increase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      removeFromCart(item.productId, item.size, item.color);
                      toast.success("Removed from bag");
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          <button
            onClick={() => setView("shop")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </button>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-32 h-fit space-y-6">
          <div className="bg-secondary/30 p-6 rounded-sm">
            <h3 className="font-serif text-xl mb-6">Order Summary</h3>

            {/* Promo */}
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Promo code"
                className="rounded-sm bg-background"
              />
              <Button
                variant="outline"
                className="rounded-sm"
                onClick={() => toast.info("Promo code applied")}
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? "Free" : `$${shipping}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Tax</span>
                <span className="font-medium">${tax.toLocaleString()}</span>
              </div>
              {shipping === 0 && subtotal > 0 && (
                <p className="text-xs text-accent flex items-center gap-1.5 pt-1">
                  <Truck className="h-3.5 w-3.5" />
                  You've qualified for free shipping
                </p>
              )}
            </div>

            <div className="h-px bg-border my-5" />

            <div className="flex justify-between items-baseline mb-6">
              <span className="font-serif text-lg">Total</span>
              <span className="font-serif text-2xl">
                ${total.toLocaleString()}
              </span>
            </div>

            <Button
              onClick={() => setView("checkout")}
              className="w-full h-12 rounded-none text-sm tracking-wide-luxe uppercase"
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <p className="text-[11px] text-muted-foreground text-center mt-4 leading-relaxed">
              By placing your order, you agree to our Terms of Service and
              Privacy Policy.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              [Shield, "Secure"],
              [RefreshCw, "30-Day Returns"],
              [Truck, "Free Ship $250+"],
            ].map(([Icon, label]) => (
              <div
                key={label as string}
                className="flex flex-col items-center gap-1.5 py-3 px-2"
              >
                {/* @ts-expect-error - icon component */}
                <Icon className="h-5 w-5 text-accent" />
                <span className="text-[11px] text-muted-foreground">
                  {label as string}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
