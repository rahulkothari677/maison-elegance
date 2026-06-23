// ─── FESTIVAL THEME PRESETS ──────────────────────────────────────────────────
//
// Each preset defines:
// 1. CSS variable overrides (applied to :root when theme is active)
// 2. Banner configuration (title, subtitle, countdown, discount badge)
// 3. Feature toggles (confetti, spin wheel, particles, sounds, tilt, marquee)
// 4. Spin wheel configuration (segments, probabilities, coupon codes)
// 5. Particle configuration (count, duration, type)
// 6. Marquee messages
//
// Colors use OKLCH format (matches the existing globals.css system).

export type SpinWheelSegment = {
  label: string;       // "10% OFF"
  code: string;        // "SAVE10"
  color: string;       // hex color
  probability: number; // 0-100, relative weight
};

export type FestivalThemeSettings = {
  // CSS variable overrides — applied to :root
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    destructive: string;
    ring: string;
  };
  radius: string;

  // Banner shown at top of every page
  banner: {
    title: string;
    subtitle: string;
    discountBadge: string;
    ctaText: string;
    ctaLink: string;
    backgroundCss: string;
    textColor: string;
    pulseAnimation: boolean;
    showCountdown: boolean;
  };

  // Feature toggles — admin can enable/disable each effect
  features: {
    confetti: boolean;      // confetti burst on activation
    spinWheel: boolean;     // spin & win popup
    particles: boolean;     // particle effects overlay
    sounds: boolean;        // festive music toggle button
    tilt: boolean;          // 3D tilt on product cards
    marquee: boolean;       // scrolling message bar
    saleStamps: boolean;    // floating X% OFF stamps on products
  };

  // Particle configuration
  particleConfig: {
    count: number;          // number of particles (10-60)
    duration: number;       // animation duration in seconds (per particle)
  };

  // Spin wheel configuration
  spinWheelConfig: {
    title: string;          // "Spin & Win!"
    subtitle: string;       // "One free spin — win an exclusive coupon"
    spinOncePerDay: boolean;
    segments: SpinWheelSegment[];
  };

  // Marquee messages
  marqueeConfig: {
    messages: string[];
    speed: number;          // seconds for one full loop (10-60)
  };

  // Optional hero overlay
  heroOverlay?: {
    enabled: boolean;
    backgroundColor: string;
    opacity: number;
  };

  // Custom font for headings (optional)
  headingFont?: string;
};

// ─── DEFAULT FEATURE CONFIG (shared across all presets) ─────────────────────

const DEFAULT_FEATURES = {
  confetti: true,
  spinWheel: true,
  particles: true,
  sounds: true,
  tilt: true,
  marquee: true,
  saleStamps: true,
};

const DEFAULT_PARTICLE_CONFIG = {
  count: 30,
  duration: 10,
};

const DEFAULT_SPIN_WHEEL: FestivalThemeSettings["spinWheelConfig"] = {
  title: "Spin & Win!",
  subtitle: "One free spin — win an exclusive festival coupon code",
  spinOncePerDay: true,
  segments: [
    { label: "10% OFF", code: "SAVE10", color: "#FF6B6B", probability: 20 },
    { label: "15% OFF", code: "SAVE15", color: "#4ECDC4", probability: 15 },
    { label: "FREE SHIP", code: "FREESHIP", color: "#FFE66D", probability: 20 },
    { label: "20% OFF", code: "SAVE20", color: "#A8E6CF", probability: 15 },
    { label: "FREE GIFT", code: "FREEGIFT", color: "#FF8B94", probability: 10 },
    { label: "25% OFF", code: "SAVE25", color: "#C7CEEA", probability: 10 },
    { label: "30% OFF", code: "SAVE30", color: "#FFD93D", probability: 8 },
    { label: "50% OFF", code: "JACKPOT50", color: "#FF1744", probability: 2 },
  ],
};

// ─── PRESETS ─────────────────────────────────────────────────────────────────

export const FESTIVAL_PRESETS: Record<string, { label: string; description: string; settings: FestivalThemeSettings }> = {
  "black-friday": {
    label: "Black Friday Sale",
    description: "Deep black + electric red + gold. Maximum urgency, maximum conversions.",
    settings: {
      colors: {
        background: "oklch(0.10 0.005 50)",
        foreground: "oklch(0.96 0.008 80)",
        card: "oklch(0.14 0.005 50)",
        cardForeground: "oklch(0.96 0.008 80)",
        primary: "oklch(0.62 0.25 25)",
        primaryForeground: "oklch(0.98 0 0)",
        secondary: "oklch(0.18 0.005 50)",
        secondaryForeground: "oklch(0.96 0.008 80)",
        accent: "oklch(0.75 0.15 85)",
        accentForeground: "oklch(0.10 0.005 50)",
        muted: "oklch(0.18 0.005 50)",
        mutedForeground: "oklch(0.65 0.008 80)",
        border: "oklch(0.25 0.005 50)",
        destructive: "oklch(0.65 0.25 25)",
        ring: "oklch(0.62 0.25 25)",
      },
      radius: "0.125rem",
      banner: {
        title: "BLACK FRIDAY",
        subtitle: "The biggest sale of the year — up to 60% off",
        discountBadge: "UP TO 60% OFF",
        ctaText: "Shop the Sale",
        ctaLink: "shop",
        backgroundCss: "linear-gradient(90deg, oklch(0.10 0.005 50) 0%, oklch(0.45 0.20 25) 50%, oklch(0.10 0.005 50) 100%)",
        textColor: "#FFFFFF",
        pulseAnimation: true,
        showCountdown: true,
      },
      features: { ...DEFAULT_FEATURES },
      particleConfig: { ...DEFAULT_PARTICLE_CONFIG },
      spinWheelConfig: { ...DEFAULT_SPIN_WHEEL },
      marqueeConfig: {
        messages: [
          "🔥 BLACK FRIDAY MEGA SALE",
          "UP TO 60% OFF EVERYTHING",
          "FREE SHIPPING ON ALL ORDERS",
          "EXTRA 10% OFF ON 2+ ITEMS",
          "USE CODE: BLACK60",
          "HURRY — ENDS SOON",
        ],
        speed: 20,
      },
      heroOverlay: { enabled: true, backgroundColor: "oklch(0.10 0.005 50)", opacity: 0.4 },
      headingFont: "var(--font-serif)",
    },
  },

  "diwali": {
    label: "Diwali Dhamaka",
    description: "Saffron + deep maroon + gold. Celebrate the festival of lights in style.",
    settings: {
      colors: {
        background: "oklch(0.20 0.04 35)",
        foreground: "oklch(0.96 0.02 85)",
        card: "oklch(0.25 0.05 35)",
        cardForeground: "oklch(0.96 0.02 85)",
        primary: "oklch(0.72 0.18 65)",
        primaryForeground: "oklch(0.20 0.04 35)",
        secondary: "oklch(0.30 0.05 35)",
        secondaryForeground: "oklch(0.96 0.02 85)",
        accent: "oklch(0.80 0.13 85)",
        accentForeground: "oklch(0.20 0.04 35)",
        muted: "oklch(0.28 0.04 35)",
        mutedForeground: "oklch(0.75 0.02 85)",
        border: "oklch(0.35 0.05 35)",
        destructive: "oklch(0.55 0.22 25)",
        ring: "oklch(0.72 0.18 65)",
      },
      radius: "0.375rem",
      banner: {
        title: "दीपावली धमाका",
        subtitle: "Festival of Lights Sale — flat 50% off everything",
        discountBadge: "FLAT 50% OFF",
        ctaText: "Celebrate & Shop",
        ctaLink: "shop",
        backgroundCss: "linear-gradient(90deg, oklch(0.30 0.05 35) 0%, oklch(0.65 0.18 65) 50%, oklch(0.30 0.05 35) 100%)",
        textColor: "#FFF8E7",
        pulseAnimation: true,
        showCountdown: true,
      },
      features: { ...DEFAULT_FEATURES },
      particleConfig: { ...DEFAULT_PARTICLE_CONFIG },
      spinWheelConfig: { ...DEFAULT_SPIN_WHEEL },
      marqueeConfig: {
        messages: [
          "🪔 DIWALI DHAMAKA",
          "FLAT 50% OFF SITEWIDE",
          "FREE GIFTS ON ORDERS ₹5000+",
          "USE CODE: DIWALI50",
          "FESTIVAL OF LIGHTS, FESTIVAL OF SAVINGS",
        ],
        speed: 20,
      },
      heroOverlay: { enabled: true, backgroundColor: "oklch(0.20 0.04 35)", opacity: 0.35 },
    },
  },

  "christmas": {
    label: "Christmas Luxury",
    description: "Forest green + burgundy + gold. Refined festive elegance.",
    settings: {
      colors: {
        background: "oklch(0.18 0.03 150)",
        foreground: "oklch(0.96 0.01 80)",
        card: "oklch(0.22 0.03 150)",
        cardForeground: "oklch(0.96 0.01 80)",
        primary: "oklch(0.40 0.18 25)",
        primaryForeground: "oklch(0.96 0.01 80)",
        secondary: "oklch(0.26 0.03 150)",
        secondaryForeground: "oklch(0.96 0.01 80)",
        accent: "oklch(0.80 0.13 85)",
        accentForeground: "oklch(0.18 0.03 150)",
        muted: "oklch(0.26 0.03 150)",
        mutedForeground: "oklch(0.72 0.02 80)",
        border: "oklch(0.32 0.03 150)",
        destructive: "oklch(0.55 0.22 25)",
        ring: "oklch(0.40 0.18 25)",
      },
      radius: "0.25rem",
      banner: {
        title: "CHRISTMAS COLLECTION",
        subtitle: "Gift the extraordinary — up to 40% off luxury",
        discountBadge: "40% OFF",
        ctaText: "Find the Perfect Gift",
        ctaLink: "shop",
        backgroundCss: "linear-gradient(90deg, oklch(0.18 0.03 150) 0%, oklch(0.40 0.18 25) 50%, oklch(0.18 0.03 150) 100%)",
        textColor: "#FFF8E7",
        pulseAnimation: false,
        showCountdown: true,
      },
      features: { ...DEFAULT_FEATURES },
      particleConfig: { ...DEFAULT_PARTICLE_CONFIG },
      spinWheelConfig: { ...DEFAULT_SPIN_WHEEL },
      marqueeConfig: {
        messages: [
          "🎄 CHRISTMAS COLLECTION",
          "UP TO 40% OFF LUXURY GIFTS",
          "FREE GIFT WRAPPING",
          "ORDER BY DEC 20 FOR CHRISTMAS DELIVERY",
          "USE CODE: XMAS40",
        ],
        speed: 20,
      },
      heroOverlay: { enabled: true, backgroundColor: "oklch(0.18 0.03 150)", opacity: 0.3 },
    },
  },

  "valentine": {
    label: "Valentine's Romance",
    description: "Blush pink + deep rose + gold. Soft, romantic, intimate.",
    settings: {
      colors: {
        background: "oklch(0.95 0.02 350)",
        foreground: "oklch(0.25 0.04 350)",
        card: "oklch(0.98 0.015 350)",
        cardForeground: "oklch(0.25 0.04 350)",
        primary: "oklch(0.55 0.20 350)",
        primaryForeground: "oklch(0.98 0.015 350)",
        secondary: "oklch(0.90 0.025 350)",
        secondaryForeground: "oklch(0.30 0.04 350)",
        accent: "oklch(0.75 0.13 85)",
        accentForeground: "oklch(0.25 0.04 350)",
        muted: "oklch(0.92 0.02 350)",
        mutedForeground: "oklch(0.50 0.03 350)",
        border: "oklch(0.88 0.025 350)",
        destructive: "oklch(0.55 0.20 350)",
        ring: "oklch(0.55 0.20 350)",
      },
      radius: "0.5rem",
      banner: {
        title: "FOR THE ONE YOU LOVE",
        subtitle: "Valentine's Edit — gifts that say everything",
        discountBadge: "25% OFF",
        ctaText: "Shop Valentine's",
        ctaLink: "shop",
        backgroundCss: "linear-gradient(90deg, oklch(0.90 0.025 350) 0%, oklch(0.75 0.15 350) 50%, oklch(0.90 0.025 350) 100%)",
        textColor: "#4A1A2A",
        pulseAnimation: false,
        showCountdown: true,
      },
      features: { ...DEFAULT_FEATURES },
      particleConfig: { ...DEFAULT_PARTICLE_CONFIG },
      spinWheelConfig: { ...DEFAULT_SPIN_WHEEL },
      marqueeConfig: {
        messages: [
          "💝 VALENTINE'S EDIT",
          "25% OFF ROMANTIC GIFTS",
          "FREE GIFT WITH EVERY ORDER",
          "USE CODE: LOVE25",
        ],
        speed: 20,
      },
      heroOverlay: { enabled: false, backgroundColor: "oklch(0.95 0.02 350)", opacity: 0.2 },
    },
  },

  "end-of-season": {
    label: "End of Season Sale",
    description: "Autumn orange + brown + cream. Warm, harvest-ready clearance vibes.",
    settings: {
      colors: {
        background: "oklch(0.95 0.02 70)",
        foreground: "oklch(0.22 0.03 50)",
        card: "oklch(0.98 0.015 70)",
        cardForeground: "oklch(0.22 0.03 50)",
        primary: "oklch(0.55 0.16 50)",
        primaryForeground: "oklch(0.98 0.015 70)",
        secondary: "oklch(0.88 0.025 70)",
        secondaryForeground: "oklch(0.28 0.03 50)",
        accent: "oklch(0.40 0.04 40)",
        accentForeground: "oklch(0.95 0.02 70)",
        muted: "oklch(0.90 0.02 70)",
        mutedForeground: "oklch(0.50 0.025 50)",
        border: "oklch(0.86 0.025 70)",
        destructive: "oklch(0.55 0.22 25)",
        ring: "oklch(0.55 0.16 50)",
      },
      radius: "0.25rem",
      banner: {
        title: "END OF SEASON SALE",
        subtitle: "Clearance — last chance at this season's pieces",
        discountBadge: "UP TO 70% OFF",
        ctaText: "Shop Clearance",
        ctaLink: "shop",
        backgroundCss: "linear-gradient(90deg, oklch(0.88 0.025 70) 0%, oklch(0.55 0.16 50) 50%, oklch(0.88 0.025 70) 100%)",
        textColor: "#2A1A0A",
        pulseAnimation: true,
        showCountdown: true,
      },
      features: { ...DEFAULT_FEATURES },
      particleConfig: { ...DEFAULT_PARTICLE_CONFIG },
      spinWheelConfig: { ...DEFAULT_SPIN_WHEEL },
      marqueeConfig: {
        messages: [
          "🦃 END OF SEASON CLEARANCE",
          "UP TO 70% OFF",
          "LAST CHANCE — FINAL REDUCTIONS",
          "NO CODE NEEDED",
          "WHEN IT'S GONE, IT'S GONE",
        ],
        speed: 20,
      },
      heroOverlay: { enabled: false, backgroundColor: "oklch(0.95 0.02 70)", opacity: 0.2 },
    },
  },

  "new-year": {
    label: "New Year Sparkle",
    description: "Midnight blue + silver + gold. Glamorous, celebratory, premium.",
    settings: {
      colors: {
        background: "oklch(0.15 0.03 250)",
        foreground: "oklch(0.95 0.01 80)",
        card: "oklch(0.20 0.03 250)",
        cardForeground: "oklch(0.95 0.01 80)",
        primary: "oklch(0.80 0.05 250)",
        primaryForeground: "oklch(0.15 0.03 250)",
        secondary: "oklch(0.24 0.03 250)",
        secondaryForeground: "oklch(0.95 0.01 80)",
        accent: "oklch(0.82 0.13 85)",
        accentForeground: "oklch(0.15 0.03 250)",
        muted: "oklch(0.24 0.03 250)",
        mutedForeground: "oklch(0.70 0.015 80)",
        border: "oklch(0.30 0.03 250)",
        destructive: "oklch(0.55 0.22 25)",
        ring: "oklch(0.80 0.05 250)",
      },
      radius: "0.375rem",
      banner: {
        title: "NEW YEAR, NEW WARDROBE",
        subtitle: "Start the year in style — up to 50% off",
        discountBadge: "50% OFF",
        ctaText: "Celebrate 2026",
        ctaLink: "shop",
        backgroundCss: "linear-gradient(90deg, oklch(0.15 0.03 250) 0%, oklch(0.45 0.10 250) 50%, oklch(0.15 0.03 250) 100%)",
        textColor: "#F5F5F0",
        pulseAnimation: true,
        showCountdown: true,
      },
      features: { ...DEFAULT_FEATURES },
      particleConfig: { ...DEFAULT_PARTICLE_CONFIG },
      spinWheelConfig: { ...DEFAULT_SPIN_WHEEL },
      marqueeConfig: {
        messages: [
          "🎊 NEW YEAR, NEW WARDROBE",
          "UP TO 50% OFF",
          "START 2026 IN STYLE",
          "USE CODE: NEWYEAR50",
        ],
        speed: 20,
      },
      heroOverlay: { enabled: true, backgroundColor: "oklch(0.15 0.03 250)", opacity: 0.35 },
    },
  },

  // ─── BLANK CUSTOM THEME (admin builds from scratch) ───────────────────────
  "custom": {
    label: "Custom Theme",
    description: "Build your own festival theme from scratch. Choose colors, banner text, features, and more.",
    settings: {
      colors: {
        background: "oklch(0.10 0.005 50)",
        foreground: "oklch(0.96 0.008 80)",
        card: "oklch(0.14 0.005 50)",
        cardForeground: "oklch(0.96 0.008 80)",
        primary: "oklch(0.62 0.25 25)",
        primaryForeground: "oklch(0.98 0 0)",
        secondary: "oklch(0.18 0.005 50)",
        secondaryForeground: "oklch(0.96 0.008 80)",
        accent: "oklch(0.75 0.15 85)",
        accentForeground: "oklch(0.10 0.005 50)",
        muted: "oklch(0.18 0.005 50)",
        mutedForeground: "oklch(0.65 0.008 80)",
        border: "oklch(0.25 0.005 50)",
        destructive: "oklch(0.65 0.25 25)",
        ring: "oklch(0.62 0.25 25)",
      },
      radius: "0.25rem",
      banner: {
        title: "MY SALE",
        subtitle: "Custom sale description here",
        discountBadge: "XX% OFF",
        ctaText: "Shop Now",
        ctaLink: "shop",
        backgroundCss: "linear-gradient(90deg, #1a1a1a 0%, #FF1744 50%, #1a1a1a 100%)",
        textColor: "#FFFFFF",
        pulseAnimation: true,
        showCountdown: true,
      },
      features: { ...DEFAULT_FEATURES },
      particleConfig: { ...DEFAULT_PARTICLE_CONFIG },
      spinWheelConfig: { ...DEFAULT_SPIN_WHEEL },
      marqueeConfig: {
        messages: ["MY SALE", "XX% OFF", "USE CODE: MYSALE"],
        speed: 20,
      },
      heroOverlay: { enabled: false, backgroundColor: "#000000", opacity: 0.3 },
    },
  },
};

// ─── Helper: apply festival theme to :root ────────────────────────────────────

export function applyFestivalTheme(settings: FestivalThemeSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  root.style.setProperty("--background", settings.colors.background);
  root.style.setProperty("--foreground", settings.colors.foreground);
  root.style.setProperty("--card", settings.colors.card);
  root.style.setProperty("--card-foreground", settings.colors.cardForeground);
  root.style.setProperty("--primary", settings.colors.primary);
  root.style.setProperty("--primary-foreground", settings.colors.primaryForeground);
  root.style.setProperty("--secondary", settings.colors.secondary);
  root.style.setProperty("--secondary-foreground", settings.colors.secondaryForeground);
  root.style.setProperty("--accent", settings.colors.accent);
  root.style.setProperty("--accent-foreground", settings.colors.accentForeground);
  root.style.setProperty("--muted", settings.colors.muted);
  root.style.setProperty("--muted-foreground", settings.colors.mutedForeground);
  root.style.setProperty("--border", settings.colors.border);
  root.style.setProperty("--destructive", settings.colors.destructive);
  root.style.setProperty("--ring", settings.colors.ring);
  root.style.setProperty("--radius", settings.radius);

  root.setAttribute("data-festival", "active");
}

export function clearFestivalTheme() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Remove festival-specific inline CSS variable overrides
  root.style.removeProperty("--background");
  root.style.removeProperty("--foreground");
  root.style.removeProperty("--card");
  root.style.removeProperty("--card-foreground");
  root.style.removeProperty("--primary");
  root.style.removeProperty("--primary-foreground");
  root.style.removeProperty("--secondary");
  root.style.removeProperty("--secondary-foreground");
  root.style.removeProperty("--accent");
  root.style.removeProperty("--accent-foreground");
  root.style.removeProperty("--muted");
  root.style.removeProperty("--muted-foreground");
  root.style.removeProperty("--border");
  root.style.removeProperty("--destructive");
  root.style.removeProperty("--ring");
  root.style.removeProperty("--radius");

  root.removeAttribute("data-festival");

  // Re-apply the Theme Studio's active theme (if any) so the site
  // doesn't fall back to CSS defaults after clearing festival overrides.
  // This fetches the active theme from the API and applies it.
  fetch("/api/themes/active")
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (data?.theme?.settings) {
        // Import applyTheme dynamically to avoid circular dependency
        import("./use-theme-settings").then(({ applyTheme }) => {
          applyTheme(data.theme.settings);
          console.log("[clearFestivalTheme] Re-applied Theme Studio theme");
        }).catch(() => {
          // If import fails, the CSS defaults from globals.css will be used
          console.log("[clearFestivalTheme] No Theme Studio theme to re-apply");
        });
      }
    })
    .catch(() => {
      // API failed — CSS defaults from globals.css will be used
    });
}

// ─── Deep clone a preset (so admin can edit without mutating) ────────────────

export function clonePresetSettings(name: string): FestivalThemeSettings | null {
  const preset = FESTIVAL_PRESETS[name];
  if (!preset) return null;
  return JSON.parse(JSON.stringify(preset.settings));
}
