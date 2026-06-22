"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ApiSlide = {
  image: string;
  season: string;
  title: string;
  titleAccent: string;
  description: string;
  ctaLabel: string;
  ctaLink: string;
};

// Default slides — used before API loads (and as a fallback if API fails)
// so the homepage never shows an empty hero.
const DEFAULT_SLIDES: ApiSlide[] = [
  {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80",
    season: "Autumn / Winter 2026",
    title: "The Art of",
    titleAccent: "Quiet Luxury.",
    description: "Handcrafted pieces from the world's finest ateliers.",
    ctaLabel: "Explore Collection",
    ctaLink: "shop",
  },
  {
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&q=80",
    season: "The Silk Collection",
    title: "Draped in",
    titleAccent: "Silk & Shadow.",
    description: "Bias-cut silk charmeuse that moves like liquid light.",
    ctaLabel: "Shop Dresses",
    ctaLink: "women",
  },
  {
    image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1920&q=80",
    season: "The Tailored Man",
    title: "Sartorial",
    titleAccent: "Perfection.",
    description: "Half-canvas wool suits hand-tailored in Naples.",
    ctaLabel: "Shop Men's",
    ctaLink: "men",
  },
  {
    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1920&q=80",
    season: "Florence Atelier",
    title: "Crafted to",
    titleAccent: "Outlive You.",
    description: "Hand-welted boots, saddle-stitched leather.",
    ctaLabel: "Shop Footwear",
    ctaLink: "footwear",
  },
  {
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1920&q=80",
    season: "The Art of Leather",
    title: "Saddle-Stitched",
    titleAccent: "Heritage.",
    description: "Full-grain Italian leather, hand-stitched in Florence.",
    ctaLabel: "Shop Accessories",
    ctaLink: "accessories",
  },
];

const SLIDE_DURATION = 6000;

export function HeroCarousel() {
  const { setCategory, setView, openProduct, setInfoPage } = useStore();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [apiSlides, setApiSlides] = useState<ApiSlide[] | null>(null);

  // Fetch slides from API on mount
  useEffect(() => {
    fetch("/api/site-content?section=heroCarousel")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.data?.slides && Array.isArray(data.data.slides) && data.data.slides.length > 0) {
          setApiSlides(data.data.slides);
        }
      })
      .catch(() => {});
  }, []);

  const slides: ApiSlide[] = apiSlides || DEFAULT_SLIDES;

  // Resolve a ctaLink string into an actual navigation action
  const resolveAction = (link: string) => {
    if (!link) return () => setView("home");
    const slug = link.toLowerCase().trim();
    if (slug === "shop" || slug === "all") return () => { setCategory("all"); setView("shop"); };
    if (slug === "women" || slug === "men" || slug === "outerwear" || slug === "footwear" || slug === "accessories") {
      return () => { setCategory(slug); setView("shop"); };
    }
    if (slug === "lookbook") return () => setView("home"); // scroll behavior — handled elsewhere
    if (slug === "community") return () => setView("community");
    if (slug === "subscription" || slug === "atelier-box") return () => setView("subscription");
    if (slug === "visual-search") return () => setView("visual-search");
    // Info pages: our-story, craftsmanship, sustainability, materials, ateliers,
    // shipping-returns, size-guide, faq, privacy, terms, contact, careers, press
    return () => setInfoPage(slug);
  };

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(next, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [next, isPaused, current]);

  const slide = slides[current];
  if (!slide) return null;

  return (
    <section
      className="relative h-[88vh] min-h-[600px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Image slides with crossfade */}
      <div className="absolute inset-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt={slide.title + " " + slide.titleAccent}
              className="w-full h-full object-cover"
              style={{
                animation: "kenburns 18s ease-in-out infinite alternate",
              }}
            />
          </motion.div>
        </AnimatePresence>
        {/* Gradient overlays — left-aligned text by default */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
        {/* Bottom fade for smooth transition into page */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        {/* Subtle accent tint at edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 80% 50%, transparent 40%, rgba(0,0,0,0.15) 100%)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl text-white"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[11px] tracking-luxe uppercase text-white/80 mb-5"
            >
              {slide.season}
            </motion.p>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-balance">
              {slide.title}
              <br />
              <span className="text-accent">{slide.titleAccent}</span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-white/85 mt-6 text-lg leading-relaxed max-w-md text-pretty"
            >
              {slide.description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-wrap gap-3 mt-9"
            >
              {slide.ctaLabel && (
                <Button
                  size="lg"
                  onClick={resolveAction(slide.ctaLink)}
                  className="rounded-none bg-white text-black hover:bg-white/90 px-8 h-12 text-sm tracking-wide-luxe uppercase"
                >
                  {slide.ctaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "transition-all rounded-full",
              i === current
                ? "w-8 h-1.5 bg-white"
                : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
            )}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20">
        <motion.div
          key={current}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
          className="h-full bg-accent"
        />
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-[10px] tracking-luxe uppercase animate-bounce">
        Scroll to Discover
      </div>

      {/* Arrow controls */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur text-white hover:bg-white/20 transition-colors flex items-center justify-center z-20"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur text-white hover:bg-white/20 transition-colors flex items-center justify-center z-20"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}
