"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Clock, ArrowRight } from "lucide-react";
import { products } from "@/lib/data";
import { useStore } from "@/lib/store";
import { useCurrency } from "@/lib/use-currency";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./ProductCard";

// Pick products that have a compareAtPrice (already discounted) for flash sale
const flashSaleProducts = products
  .filter((p) => p.compareAtPrice)
  .slice(0, 4);

function useCountdown(endsAt: string | null) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!endsAt) {
      setActive(false);
      return;
    }
    const end = new Date(endsAt).getTime();
    if (isNaN(end)) {
      setActive(false);
      return;
    }
    const update = () => {
      const diff = end - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setActive(false);
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours: h, minutes: m, seconds: s });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return { timeLeft, active };
}

export function FlashSaleSection() {
  const { setView, openProduct } = useStore();
  const { convert } = useCurrency();
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetch("/api/site-content?section=flashSale")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.data) setConfig(data.data);
      })
      .catch(() => {});
  }, []);

  const { timeLeft, active } = useCountdown(config?.endsAt || null);
  const pad = (n: number) => String(n).padStart(2, "0");

  // Hide if admin disabled it OR no products on sale OR countdown expired
  if (config?.enabled === false) return null;
  if (flashSaleProducts.length === 0) return null;
  if (config?.endsAt && !active) return null;

  // Calculate total savings
  const totalSavings = flashSaleProducts.reduce(
    (sum, p) => sum + ((p.compareAtPrice || 0) - p.price),
    0
  );

  return (
    <section className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-16 lg:py-20">
        {/* Header with countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <Zap className="h-4 w-4 text-accent-foreground" fill="currentColor" />
              </div>
              <p className="text-[11px] tracking-luxe uppercase text-accent font-medium">
                {config?.badge ? `Limited Time · ${config.badge}` : "Limited Time · Up to 20% Off"}
              </p>
            </div>
            <h2 className="font-serif text-4xl lg:text-5xl text-balance">
              {config?.title || "Flash Sale"}
            </h2>
            <p className="text-primary-foreground/70 mt-2 max-w-md">
              {config?.subtitle || `Save ${convert(totalSavings)} across ${flashSaleProducts.length} premium pieces. Ends soon — once it's gone, it's gone.`}
            </p>
          </div>

          {/* Countdown timer */}
          {active && (
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-accent" />
              <div className="flex items-center gap-2">
                {[
                  { label: "Hours", value: timeLeft.hours },
                  { label: "Min", value: timeLeft.minutes },
                  { label: "Sec", value: timeLeft.seconds },
                ].map((unit, i) => (
                  <div key={unit.label} className="flex items-center gap-2">
                    <div className="text-center">
                      <div className="bg-primary-foreground/10 backdrop-blur border border-primary-foreground/20 rounded-sm w-16 h-16 flex items-center justify-center">
                        <span className="font-serif text-2xl tabular-nums">
                          {pad(unit.value)}
                        </span>
                      </div>
                      <p className="text-[9px] tracking-wide-luxe uppercase text-primary-foreground/60 mt-1">
                        {unit.label}
                      </p>
                    </div>
                    {i < 2 && (
                      <span className="font-serif text-2xl text-accent">:</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Products grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6"
        >
          {flashSaleProducts.map((p) => (
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

        {/* CTA */}
        <div className="text-center mt-10">
          <Button
            onClick={() => setView("shop")}
            className="rounded-none h-12 px-8 text-sm tracking-wide-luxe uppercase bg-accent text-accent-foreground hover:bg-accent/90 border border-accent"
          >
            Shop All Sale Items
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

// Compact flash sale badge for product cards
export function FlashSaleBadge({ product }: { product: any }) {
  if (!product.compareAtPrice) return null;
  const discount = Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
  );
  if (discount < 10) return null;

  return (
    <span className="bg-red-600 text-white text-[10px] tracking-wide-luxe uppercase px-2 py-1 font-medium inline-flex items-center gap-1">
      <Zap className="h-2.5 w-2.5" fill="currentColor" />
      {discount}% Off
    </span>
  );
}
