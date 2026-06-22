"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Upload, Loader2, X, Sparkles, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { products } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "./ProductCard";
import { toast } from "sonner";

export function VisualSearch() {
  const { openProduct } = useStore();
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    description: string;
    products: any[];
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    // Convert to base64 for the API
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setImageUrl(base64);
      await search(base64);
    };
    reader.readAsDataURL(file);
  };

  const search = async (url: string) => {
    if (!url.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch("/api/ai/visual-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: url,
          products: products.map((p) => ({
            name: p.name,
            price: p.price,
            shortDescription: p.shortDescription,
            category: p.category,
            colors: p.colors,
          })),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data);
    } catch (e: any) {
      toast.error("Could not analyze image. Try a different photo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-4">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span className="text-[11px] tracking-wide-luxe uppercase text-accent font-medium">
            AI Visual Search · Powered by Z.ai
          </span>
        </div>
        <h1 className="font-serif text-4xl lg:text-5xl">Find by Photo</h1>
        <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
          Upload any fashion photo — from Pinterest, Instagram, or your camera roll —
          and our AI will find similar pieces from our collection.
        </p>
      </motion.div>

      {/* Upload area */}
      <div className="space-y-4 mb-10">
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-border rounded-sm p-12 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
        >
          {imageUrl ? (
            <div className="relative inline-block">
              <img
                src={imageUrl}
                alt="Search query"
                className="max-h-64 rounded-sm mx-auto"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImageUrl("");
                  setResults(null);
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Click or drag a photo here</p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WebP · Any fashion photo works
              </p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFile(e.target.files)}
            className="hidden"
          />
        </div>

        {/* URL input */}
        <div className="flex gap-2">
          <Input
            value={imageUrl.startsWith("data:") ? "" : imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") search(imageUrl); }}
            placeholder="Or paste an image URL..."
            className="rounded-sm"
          />
          <Button
            onClick={() => search(imageUrl)}
            disabled={loading || !imageUrl.trim()}
            className="rounded-sm shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Analyzing image with AI vision...</p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {results && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* AI description */}
            <div className="bg-accent/5 border border-accent/20 rounded-sm p-4 mb-6">
              <p className="text-[10px] tracking-wide-luxe uppercase text-accent mb-1">
                ✦ AI Analysis
              </p>
              <p className="text-sm">{results.description}</p>
            </div>

            {/* Matched products */}
            <h3 className="font-serif text-xl mb-6">Similar Pieces</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-6">
              {results.products.map((p: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="space-y-2"
                >
                  <ProductCard product={p} />
                  <div className="bg-muted/50 rounded-sm p-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] tracking-wide-luxe uppercase text-accent">
                        {p.similarity === "high" ? "🎯 Close match" : p.similarity === "medium" ? "Similar style" : "Related"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.matchReason}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
