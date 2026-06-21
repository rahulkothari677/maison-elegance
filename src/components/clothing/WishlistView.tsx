"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { useUserData } from "@/lib/use-user-data";
import { getProductById } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./ProductCard";

export function WishlistView() {
  const { wishlist: localWishlist, setView } = useStore();
  const {
    wishlist: apiWishlist,
    isAuthenticated,
    toggleWishlist: toggleApiWishlist,
  } = useUserData();

  // Authed users see API wishlist; non-authed see local
  const items = isAuthenticated
    ? apiWishlist
    : localWishlist
        .map((id) => getProductById(id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const handleRemove = (id: string) => {
    if (isAuthenticated) {
      toggleApiWishlist(id);
    } else {
      useStore.getState().toggleWishlist(id);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center mb-6">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-4xl mb-3">Your wishlist is empty</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Save pieces you love by tapping the heart icon. We'll keep them
            here for you.
          </p>
          <Button
            onClick={() => setView("shop")}
            className="rounded-none h-12 px-8 text-sm tracking-wide-luxe uppercase"
          >
            Discover Pieces
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
          Saved Pieces
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl">Your Wishlist</h1>
        <p className="text-muted-foreground mt-2">
          {items.length} {items.length === 1 ? "piece" : "pieces"} saved
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
        {items.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="relative"
          >
            <ProductCard product={p} />
            <button
              onClick={() => handleRemove(p.id)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
              aria-label="Remove from wishlist"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 text-center border-t border-border pt-12">
        <Button
          onClick={() => setView("shop")}
          variant="outline"
          className="rounded-none h-12 px-8 text-sm tracking-wide-luxe uppercase"
        >
          Continue Shopping
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
