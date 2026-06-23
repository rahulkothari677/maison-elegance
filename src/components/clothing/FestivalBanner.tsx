"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight, Zap, Flame } from "lucide-react";
import { useStore } from "@/lib/store";
import { applyFestivalTheme, clearFestivalTheme, type FestivalThemeSettings } from "@/lib/festival-themes";
import { FestivalParticles } from "./FestivalParticles";
import { FestivalConfetti } from "./FestivalConfetti";
import { FestivalSpinWheel } from "./FestivalSpinWheel";
import { FestivalSounds } from "./FestivalSounds";

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

// Sale messages for the scrolling marquee — customized per theme
const MARQUEE_MESSAGES: Record<string, string[]> = {
  "black-friday": [
    "🔥 BLACK FRIDAY MEGA SALE",
    "UP TO 60% OFF EVERYTHING",
    "FREE SHIPPING ON ALL ORDERS",
    "EXTRA 10% OFF ON 2+ ITEMS",
    "USE CODE: BLACK60",
    "HURRY — ENDS SOON",
  ],
  "diwali": [
    "🪔 DIWALI DHAMAKA",
    "FLAT 50% OFF SITEWIDE",
    "FREE GIFTS ON ORDERS ₹5000+",
    "USE CODE: DIWALI50",
    "FESTIVAL OF LIGHTS, FESTIVAL OF SAVINGS",
    "SHOP NOW — LIMITED TIME",
  ],
  "christmas": [
    "🎄 CHRISTMAS COLLECTION",
    "UP TO 40% OFF LUXURY GIFTS",
    "FREE GIFT WRAPPING",
    "ORDER BY DEC 20 FOR CHRISTMAS DELIVERY",
    "USE CODE: XMAS40",
    "GIFT THE EXTRAORDINARY",
  ],
  "valentine": [
    "💝 VALENTINE'S EDIT",
    "25% OFF ROMANTIC GIFTS",
    "FREE GIFT WITH EVERY ORDER",
    "USE CODE: LOVE25",
    "FOR THE ONE YOU LOVE",
    "SHOP BEFORE THEY'RE GONE",
  ],
  "end-of-season": [
    "🦃 END OF SEASON CLEARANCE",
    "UP TO 70% OFF",
    "LAST CHANCE — FINAL REDUCTIONS",
    "NO CODE NEEDED",
    "WHEN IT'S GONE, IT'S GONE",
    "CLEARANCE PRICES",
  ],
  "new-year": [
    "🎊 NEW YEAR, NEW WARDROBE",
    "UP TO 50% OFF",
    "START 2026 IN STYLE",
    "USE CODE: NEWYEAR50",
    "FRESH ARRIVALS, FRESH PRICES",
    "CELEBRATE & SAVE",
  ],
};

export function FestivalBanner() {
  const [festival, setFestival] = useState<ActiveFestival | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
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
          clearFestivalTheme();
          return;
        }
        try {
          setFestival(data.theme);
          applyFestivalTheme(data.theme.settings);
          // Fire confetti burst when festival activates
          setConfettiTrigger((t) => t + 1);
        } catch (e) {
          console.warn("[FestivalBanner] Failed to apply theme:", e);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!festival?.endDate) return;
    const end = new Date(festival.endDate).getTime();
    if (Date.now() >= end) {
      clearFestivalTheme();
      setFestival(null);
    }
  }, [festival?.endDate]);

  // ⚠️ Hooks must be called BEFORE any early return (Rules of Hooks)
  const { timeLeft, active } = useCountdown(festival?.endDate || null);

  const marqueeMessages = useMemo(() => {
    if (!festival) return [];
    return MARQUEE_MESSAGES[festival.name] || MARQUEE_MESSAGES["black-friday"];
  }, [festival?.name]);

  if (!festival || dismissed) return null;

  const { banner, colors } = festival.settings;
  const pad = (n: number) => String(n).padStart(2, "0");

  // Use the theme's accent color for badge backgrounds with dark text
  // This ensures high contrast on both light and dark festival themes
  const badgeBg = colors.accent; // gold for most themes
  const badgeText = colors.accentForeground; // dark text on gold

  const handleCta = () => {
    const link = banner.ctaLink || "shop";
    if (link === "shop" || link === "all") {
      setView("shop");
    } else {
      setView("shop");
    }
  };

  return (
    <>
      {/* Particle effects — fixed overlay across entire viewport */}
      <FestivalParticles themeName={festival.name} />

      {/* Confetti burst — fires once when festival activates */}
      <FestivalConfetti trigger={confettiTrigger} themeName={festival.name} />

      {/* Spin & Win wheel popup — appears once per day when festival is active */}
      <FestivalSpinWheel festivalName={festival.name} />

      {/* Festive sound toggle button — bottom-right corner */}
      <FestivalSounds />

      <AnimatePresence>
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="sticky top-0 z-[60] w-full overflow-hidden"
          style={{
            background: banner.backgroundCss,
            color: banner.textColor,
            animation: "festival-glow 3s ease-in-out infinite",
          }}
        >
          {/* Top row: badge + title + countdown + CTA */}
          <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-10 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 relative">
            {/* Left: pulsing discount badge */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-sm font-bold text-[10px] sm:text-xs tracking-wide-luxe uppercase shrink-0"
              style={{
                background: badgeBg,
                color: badgeText,
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="currentColor" />
              <span className="hidden sm:inline">{banner.discountBadge}</span>
              <span className="sm:hidden">{banner.discountBadge.split(" ")[0]}</span>
            </motion.div>

            {/* Center: title + subtitle */}
            <div className="flex flex-col items-center text-center min-w-0 flex-1">
              <motion.h2
                animate={banner.pulseAnimation ? { scale: [1, 1.03, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="font-serif text-sm sm:text-lg lg:text-xl font-bold tracking-wide leading-tight truncate w-full"
              >
                {banner.title}
              </motion.h2>
              <span className="hidden sm:block text-[10px] sm:text-xs opacity-90 truncate w-full">
                {banner.subtitle}
              </span>
            </div>

            {/* Countdown — always visible, glowing */}
            {banner.showCountdown && active && (
              <div className="flex items-center gap-1 shrink-0">
                {[
                  { label: "D", value: timeLeft.days },
                  { label: "H", value: timeLeft.hours },
                  { label: "M", value: timeLeft.minutes },
                  { label: "S", value: timeLeft.seconds },
                ].map((unit, i) => (
                  <div key={unit.label} className="flex items-center gap-0.5 sm:gap-1">
                    <div className="flex flex-col items-center">
                      <div
                        className="font-mono text-xs sm:text-base font-bold tabular-nums leading-none px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-sm"
                        style={{
                          background: "rgba(0,0,0,0.4)",
                          backdropFilter: "blur(4px)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          minWidth: "24px",
                          textAlign: "center",
                        }}
                      >
                        {pad(unit.value)}
                      </div>
                      <span className="text-[8px] sm:text-[9px] opacity-70 uppercase mt-0.5">{unit.label}</span>
                    </div>
                    {i < 3 && <span className="opacity-50 font-bold -mt-3">:</span>}
                  </div>
                ))}
              </div>
            )}

            {/* CTA button */}
            <button
              onClick={handleCta}
              className="shrink-0 inline-flex items-center gap-1 px-2.5 sm:px-4 py-1.5 rounded-sm font-medium text-[10px] sm:text-xs tracking-wide-luxe uppercase transition-transform hover:scale-105 active:scale-95"
              style={{
                background: badgeBg,
                color: badgeText,
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              <span className="hidden sm:inline">{banner.ctaText}</span>
              <span className="sm:hidden">Shop</span>
              <ArrowRight className="h-3 w-3" />
            </button>

            {/* Dismiss button */}
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="absolute -right-1 -top-1 sm:right-2 sm:top-1/2 sm:-translate-y-1/2 w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Scrolling marquee with sale messages */}
          {marqueeMessages.length > 0 && (
            <div
              className="overflow-hidden py-1 border-t"
              style={{ borderColor: "rgba(255,255,255,0.15)" }}
            >
              <div className="flex festival-marquee whitespace-nowrap">
                {[...marqueeMessages, ...marqueeMessages, ...marqueeMessages].map((msg, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center text-[10px] sm:text-xs font-medium tracking-wide-luxe uppercase px-4 sm:px-6"
                  >
                    <Sparkles className="h-3 w-3 mr-2 opacity-70" />
                    {msg}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
