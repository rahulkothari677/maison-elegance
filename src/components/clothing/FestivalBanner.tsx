"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { applyFestivalTheme, clearFestivalTheme, type FestivalThemeSettings } from "@/lib/festival-themes";

type ActiveFestival = {
  id: string;
  name: string;
  label: string;
  description: string | null;
  settings: FestivalThemeSettings;
  startDate: string | null;
  endDate: string | null;
};

function useCountdown(endDate: string | null) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!endDate) {
      setActive(false);
      return;
    }
    const end = new Date(endDate).getTime();
    if (isNaN(end)) {
      setActive(false);
      return;
    }
    const update = () => {
      const diff = end - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setActive(false);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return { timeLeft, active };
}

export function FestivalBanner() {
  const [festival, setFestival] = useState<ActiveFestival | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const { setView } = useStore();

  useEffect(() => {
    let mounted = true;
    fetch("/api/festival-themes")
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (!mounted || !data || !data.theme) {
          // No active theme — clear any leftover styles
          clearFestivalTheme();
          return;
        }
        try {
          setFestival(data.theme);
          applyFestivalTheme(data.theme.settings);
        } catch (e) {
          // If applying theme fails, don't crash the page
          console.warn("[FestivalBanner] Failed to apply theme:", e);
        }
      })
      .catch(() => {
        // Network error — silently ignore, page still works
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-dismiss after sale ends
  useEffect(() => {
    if (!festival?.endDate) return;
    const end = new Date(festival.endDate).getTime();
    if (Date.now() >= end) {
      clearFestivalTheme();
      setFestival(null);
    }
  }, [festival?.endDate]);

  if (!festival || dismissed) return null;

  const { banner } = festival.settings;
  const { timeLeft, active } = useCountdown(festival.endDate);
  const pad = (n: number) => String(n).padStart(2, "0");

  const handleCta = () => {
    const link = banner.ctaLink || "shop";
    if (link === "shop" || link === "all") {
      setView("shop");
    } else {
      // Could route to category — for now just go to shop
      setView("shop");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="sticky top-0 z-[60] w-full overflow-hidden"
        style={{
          background: banner.backgroundCss,
          color: banner.textColor,
        }}
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-center gap-4 relative">
          {/* Left: discount badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-sm font-bold text-xs tracking-wide-luxe uppercase shrink-0"
            style={{
              background: banner.textColor,
              color: banner.backgroundCss.includes("oklch(0.10") ? "#000" : "#fff",
            }}
          >
            <Sparkles className="h-3 w-3" />
            {banner.discountBadge}
          </div>

          {/* Center: title + subtitle */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <motion.h2
              animate={banner.pulseAnimation ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="font-serif text-base sm:text-lg lg:text-xl font-bold tracking-wide"
            >
              {banner.title}
            </motion.h2>
            <span className="hidden sm:inline opacity-60">·</span>
            <span className="text-xs sm:text-sm opacity-90">{banner.subtitle}</span>
          </div>

          {/* Countdown (if active) */}
          {banner.showCountdown && active && (
            <div className="hidden md:flex items-center gap-1.5 shrink-0">
              {[
                { label: "D", value: timeLeft.days },
                { label: "H", value: timeLeft.hours },
                { label: "M", value: timeLeft.minutes },
                { label: "S", value: timeLeft.seconds },
              ].map((unit, i) => (
                <div key={unit.label} className="flex items-center gap-1.5">
                  <div
                    className="text-center min-w-[28px] px-1.5 py-1 rounded-sm font-mono text-sm font-bold tabular-nums"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {pad(unit.value)}
                  </div>
                  <span className="text-[10px] opacity-70 uppercase">{unit.label}</span>
                  {i < 3 && <span className="opacity-50">:</span>}
                </div>
              ))}
            </div>
          )}

          {/* CTA button */}
          <button
            onClick={handleCta}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-sm font-medium text-xs tracking-wide-luxe uppercase transition-transform hover:scale-105"
            style={{
              background: banner.textColor,
              color: banner.backgroundCss.includes("oklch(0.10") ? "#000" : "#fff",
            }}
          >
            {banner.ctaText}
            <ArrowRight className="h-3 w-3" />
          </button>

          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
