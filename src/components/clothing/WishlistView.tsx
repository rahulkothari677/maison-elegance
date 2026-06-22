"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  ArrowRight,
  Trash2,
  FolderPlus,
  Folder,
  Share2,
  Copy,
  Check,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useUserData } from "@/lib/use-user-data";
import { getProductById } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductCard } from "./ProductCard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function WishlistView() {
  const {
    wishlist: localWishlist,
    setView,
    wishlistFolders,
    addToFolder,
    removeFromFolder,
    createFolder,
    deleteFolder,
  } = useStore();
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

  // Active folder view: "all" or a folder ID
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const handleRemove = (id: string) => {
    if (isAuthenticated) {
      toggleApiWishlist(id);
    } else {
      useStore.getState().toggleWishlist(id);
    }
  };

  // Generate a shareable URL with product IDs encoded
  const generateShareUrl = () => {
    const ids = items.map((p: any) => p.id || p.slug).join(",");
    const url = `${window.location.origin}/?share=${encodeURIComponent(ids)}`;
    return url;
  };

  const handleCopyShare = async () => {
    const url = generateShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied!", {
        description: "Anyone with this link can view your wishlist",
      });
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast.success("Share link copied!");
    }
  };

  const handleCreateFolder = () => {
    const name = newFolderName.trim();
    if (!name) return;
    if (Object.values(wishlistFolders).some((f) => f.name === name)) {
      toast.error("A folder with this name already exists");
      return;
    }
    const id = createFolder(name);
    setNewFolderName("");
    setShowNewFolder(false);
    setActiveFolder(id);
    toast.success(`Folder "${name}" created`);
  };

  // Filter items by active folder
  const visibleItems =
    activeFolder === "all"
      ? items
      : items.filter((p: any) =>
          wishlistFolders[activeFolder]?.productIds.includes(p.id || p.slug)
        );

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
        className="mb-8"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
              Saved Pieces
            </p>
            <h1 className="font-serif text-4xl lg:text-5xl">Your Wishlist</h1>
            <p className="text-muted-foreground mt-2">
              {items.length} {items.length === 1 ? "piece" : "pieces"} saved
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShareDialogOpen(true)}
              className="rounded-sm"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Folders bar */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => setActiveFolder("all")}
          className={cn(
            "px-4 h-9 text-sm tracking-wide whitespace-nowrap border transition-all rounded-full inline-flex items-center gap-1.5",
            activeFolder === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border hover:border-primary"
          )}
        >
          <Heart className="h-3.5 w-3.5" />
          All ({items.length})
        </button>
        {Object.entries(wishlistFolders).map(([id, folder]) => (
          <button
            key={id}
            onClick={() => setActiveFolder(id)}
            className={cn(
              "px-4 h-9 text-sm tracking-wide whitespace-nowrap border transition-all rounded-full inline-flex items-center gap-1.5 group",
              activeFolder === id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-primary"
            )}
          >
            <Folder className="h-3.5 w-3.5" />
            {folder.name} ({folder.productIds.length})
            {id !== "favs" && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFolder(id);
                  if (activeFolder === id) setActiveFolder("all");
                  toast.success("Folder deleted");
                }}
                className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
              >
                <X className="h-3 w-3" />
              </span>
            )}
          </button>
        ))}
        {showNewFolder ? (
          <div className="flex items-center gap-1.5">
            <Input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") {
                  setShowNewFolder(false);
                  setNewFolderName("");
                }
              }}
              placeholder="Folder name..."
              className="h-9 w-32 rounded-full text-sm"
            />
            <Button
              size="sm"
              onClick={handleCreateFolder}
              className="h-9 rounded-full px-3"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowNewFolder(false);
                setNewFolderName("");
              }}
              className="h-9 w-9 p-0 rounded-full"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewFolder(true)}
            className="px-4 h-9 text-sm tracking-wide whitespace-nowrap border border-dashed border-border hover:border-primary rounded-full inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            New Folder
          </button>
        )}
      </div>

      {/* Items grid */}
      {visibleItems.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-sm">
          <Folder className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No items in this folder</p>
          <p className="text-sm text-muted-foreground mt-1">
            Switch to "All" and tap the folder icon on a product to add it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
          {visibleItems.map((p: any, idx: number) => (
            <motion.div
              key={p.id || p.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative"
            >
              <ProductCard product={p} />
              <button
                onClick={() => handleRemove(p.id || p.slug)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

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

      {/* Share dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-accent" />
              Share Your Wishlist
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate a public link to your wishlist. Anyone with this link
              can view your saved pieces — perfect for sharing with family,
              friends, or a personal stylist.
            </p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={generateShareUrl()}
                className="rounded-sm text-xs font-mono"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                onClick={handleCopyShare}
                className="rounded-sm shrink-0"
              >
                <Copy className="h-4 w-4 mr-1.5" />
                Copy
              </Button>
            </div>
            <div className="bg-secondary/30 p-3 rounded-sm text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">What they'll see:</p>
              <p>Your {items.length} saved pieces with images, prices, and
              descriptions — but not your personal info or account details.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
