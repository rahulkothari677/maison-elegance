"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, Loader2, X, ShoppingBag, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { products } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "./ProductCard";
import { toast } from "sonner";

export function OutfitGenerator() {
  const { setView, openProduct, addToCart } = useStore();
  const [occasion, setOccasion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    title: string;
    description: string;
    products: any[];
  } | null>(null);

  const occasions = [
    "Black tie wedding in Tuscany",
    "Office winter party",
    "Weekend in Florence",
    "First date at a gallery",
    "Beach vacation dinner",
  ];

  const generate = async () => {
    if (!occasion.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion,
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
      setResult(data);
    } catch (e: any) {
      toast.error("Could not generate outfit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const total = result?.products.reduce((sum, p) => sum + p.price, 0) || 0;

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-20 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-[11px] tracking-wide-luxe uppercase text-accent font-medium">
              AI-Powered · Powered by Z.ai
            </span>
          </div>
          <h2 className="font-serif text-4xl lg:text-5xl text-balance">
            AI Outfit Generator
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-lg text-pretty">
            Describe your occasion and our AI stylist will curate a complete look
            from our collection — tailored to the moment.
          </p>
        </motion.div>

        {/* Input */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex gap-2">
            <Input
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") generate(); }}
              placeholder="e.g., Black tie wedding in Tuscany"
              className="rounded-sm h-14 text-base"
            />
            <Button
              onClick={generate}
              disabled={loading || !occasion.trim()}
              className="rounded-sm h-14 px-6 text-sm tracking-wide-luxe uppercase shrink-0"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
          {/* Quick occasions */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {occasions.map((occ) => (
              <button
                key={occ}
                onClick={() => setOccasion(occ)}
                className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-accent/15 hover:text-accent transition-colors"
              >
                {occ}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={result.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Outfit title + description */}
              <div className="text-center mb-10">
                <h3 className="font-serif text-3xl lg:text-4xl text-accent">
                  {result.title}
                </h3>
                <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
                  {result.description}
                </p>
                <p className="font-serif text-xl mt-4">
                  Complete look: ${total.toLocaleString()}
                </p>
              </div>

              {/* Products grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 max-w-6xl mx-auto">
                {result.products.map((p: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="space-y-2"
                  >
                    <ProductCard product={p} />
                    {/* AI reason */}
                    <div className="bg-accent/5 border border-accent/20 rounded-sm p-3">
                      <p className="text-[10px] tracking-wide-luxe uppercase text-accent mb-1">
                        ✦ Why this piece
                      </p>
                      <p className="text-xs text-muted-foreground">{p.reason}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add all to bag */}
              <div className="text-center mt-10">
                <Button
                  onClick={() => {
                    result.products.forEach((p) => {
                      addToCart(p, p.sizes[0], p.colors[0].name, 1);
                    });
                    toast.success(`Complete look added to bag — $${total.toLocaleString()}`);
                  }}
                  className="rounded-none h-12 px-8 text-sm tracking-wide-luxe uppercase"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Add Complete Look to Bag · ${total.toLocaleString()}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
