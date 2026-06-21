"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  Truck,
  Shield,
  Gift,
} from "lucide-react";
import { useStore, cartSubtotal, cartCount } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function CartDrawer() {
  const {
    cart,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateCartQty,
    removeFromCart,
    setView,
    openProduct,
  } = useStore();

  // Lock body scroll when open
  useEffect(() => {
    if (cartDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartDrawerOpen]);

  const subtotal = cartSubtotal(cart);
  const count = cartCount(cart);
  const remainingForFreeShip = Math.max(0, 250 - subtotal);
  const freeShipProgress = Math.min(100, (subtotal / 250) * 100);

  const handleCheckout = () => {
    setCartDrawerOpen(false);
    setView("checkout");
  };

  const handleViewBag = () => {
    setCartDrawerOpen(false);
    setView("cart");
  };

  return (
    <AnimatePresence>
      {cartDrawerOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setCartDrawerOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-background flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5" />
                <h2 className="font-serif text-xl">Your Bag</h2>
                {count > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({count} {count === 1 ? "item" : "items"})
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCartDrawerOpen(false)}
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-5">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-2xl mb-2">Your bag is empty</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                  Discover pieces crafted to outlast trends.
                </p>
                <Button
                  onClick={() => {
                    setCartDrawerOpen(false);
                    setView("shop");
                  }}
                  className="rounded-none h-11 px-6 text-sm tracking-wide-luxe uppercase"
                >
                  Browse Collection
                </Button>
              </div>
            ) : (
              <>
                {/* Free shipping progress */}
                <div className="px-6 py-4 bg-secondary/30 border-b border-border">
                  {remainingForFreeShip > 0 ? (
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-accent" />
                      Add{" "}
                      <span className="text-foreground font-medium">
                        ${remainingForFreeShip}
                      </span>{" "}
                      more for free express shipping
                    </p>
                  ) : (
                    <p className="text-xs text-accent mb-2 flex items-center gap-1.5">
                      <Gift className="h-3.5 w-3.5" />
                      You've unlocked free express shipping!
                    </p>
                  )}
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShipProgress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full bg-accent"
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <AnimatePresence initial={false}>
                    {cart.map((item) => (
                      <motion.div
                        key={`${item.productId}-${item.size}-${item.color}`}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-4 py-4 border-b border-border last:border-0"
                      >
                        <button
                          onClick={() => {
                            setCartDrawerOpen(false);
                            openProduct(item.productId);
                          }}
                          className="shrink-0"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-26 object-cover rounded-sm"
                          />
                        </button>
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => {
                              setCartDrawerOpen(false);
                              openProduct(item.productId);
                            }}
                            className="text-sm font-serif text-left hover:text-accent transition-colors line-clamp-2"
                          >
                            {item.name}
                          </button>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.color} · Size {item.size}
                          </p>
                          <div className="flex items-center justify-between mt-3">
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
                                className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                                aria-label="Decrease"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-xs font-medium">
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
                                className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                                aria-label="Increase"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium">
                                ${(item.price * item.quantity).toLocaleString()}
                              </span>
                              <button
                                onClick={() =>
                                  removeFromCart(item.productId, item.size, item.color)
                                }
                                className="text-muted-foreground hover:text-destructive transition-colors"
                                aria-label="Remove"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="border-t border-border p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="font-serif text-xl">
                      ${subtotal.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Shipping & taxes calculated at checkout
                  </p>
                  <Button
                    onClick={handleCheckout}
                    className="w-full h-12 rounded-none text-sm tracking-wide-luxe uppercase"
                  >
                    Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleViewBag}
                    variant="outline"
                    className="w-full h-11 rounded-none text-sm tracking-wide-luxe uppercase"
                  >
                    View Full Bag
                  </Button>
                  <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Shield className="h-3 w-3" />
                      Secure
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Truck className="h-3 w-3" />
                      Free Ship $250+
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
