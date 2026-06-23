// ─── FESTIVAL THEME PRESETS ──────────────────────────────────────────────────
//
// Each preset defines:
// 1. CSS variable overrides (applied to :root when theme is active)
// 2. Banner configuration (title, subtitle, countdown, discount badge)
// 3. Optional background image / pattern
//
// Colors use OKLCH format (matches the existing globals.css system) for
// wide gamut support and perceptual consistency.

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
  radius: string; // e.g. "0.25rem" (sharper for urgency, softer for romance)
  // Banner shown at top of every page
  banner: {
    title: string;
    subtitle: string;
    discountBadge: string; // "40% OFF" / "FLAT 50% OFF"
    ctaText: string; // "Shop Sale"
    ctaLink: string; // "shop" or category slug
    backgroundCss: string; // CSS background value (gradient, solid, etc.)
    textColor: string;
    pulseAnimation: boolean; // pulse the title?
    showCountdown: boolean;
  };
  // Optional hero overlay
  heroOverlay?: {
    enabled: boolean;
    backgroundColor: string;
    opacity: number; // 0-1
  };
  // Custom font for headings (optional — falls back to serif)
  headingFont?: string;
};

export const FESTIVAL_PRESETS: Record<string, { label: string; description: string; settings: FestivalThemeSettings }> = {
  // ─── BLACK FRIDAY ──────────────────────────────────────────────────────────
  "black-friday": {
    label: "Black Friday Sale",
    description: "Deep black + electric red + gold. Maximum urgency, maximum conversions.",
    settings: {
      colors: {
        background: "oklch(0.10 0.005 50)",         // near-black
        foreground: "oklch(0.96 0.008 80)",          // warm white
        card: "oklch(0.14 0.005 50)",                // dark card
        cardForeground: "oklch(0.96 0.008 80)",
        primary: "oklch(0.62 0.25 25)",              // electric red
        primaryForeground: "oklch(0.98 0 0)",
        secondary: "oklch(0.18 0.005 50)",
        secondaryForeground: "oklch(0.96 0.008 80)",
        accent: "oklch(0.75 0.15 85)",               // gold
        accentForeground: "oklch(0.10 0.005 50)",
        muted: "oklch(0.18 0.005 50)",
        mutedForeground: "oklch(0.65 0.008 80)",
        border: "oklch(0.25 0.005 50)",
        destructive: "oklch(0.65 0.25 25)",
        ring: "oklch(0.62 0.25 25)",
      },
      radius: "0.125rem", // sharp corners for urgency
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
      heroOverlay: {
        enabled: true,
        backgroundColor: "oklch(0.10 0.005 50)",
        opacity: 0.4,
      },
      headingFont: "var(--font-serif)",
    },
  },

  // ─── DIWALI DHAMAKA ─────────────────────────────────────────────────────────
  "diwali": {
    label: "Diwali Dhamaka",
    description: "Saffron + deep maroon + gold. Celebrate the festival of lights in style.",
    settings: {
      colors: {
        background: "oklch(0.20 0.04 35)",           // deep maroon
        foreground: "oklch(0.96 0.02 85)",            // warm cream
        card: "oklch(0.25 0.05 35)",
        cardForeground: "oklch(0.96 0.02 85)",
        primary: "oklch(0.72 0.18 65)",               // saffron
        primaryForeground: "oklch(0.20 0.04 35)",
        secondary: "oklch(0.30 0.05 35)",
        secondaryForeground: "oklch(0.96 0.02 85)",
        accent: "oklch(0.80 0.13 85)",                // gold
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
      heroOverlay: {
        enabled: true,
        backgroundColor: "oklch(0.20 0.04 35)",
        opacity: 0.35,
      },
    },
  },

  // ─── CHRISTMAS LUXURY ───────────────────────────────────────────────────────
  "christmas": {
    label: "Christmas Luxury",
    description: "Forest green + burgundy + gold. Refined festive elegance.",
    settings: {
      colors: {
        background: "oklch(0.18 0.03 150)",          // deep forest green
        foreground: "oklch(0.96 0.01 80)",
        card: "oklch(0.22 0.03 150)",
        cardForeground: "oklch(0.96 0.01 80)",
        primary: "oklch(0.40 0.18 25)",               // burgundy
        primaryForeground: "oklch(0.96 0.01 80)",
        secondary: "oklch(0.26 0.03 150)",
        secondaryForeground: "oklch(0.96 0.01 80)",
        accent: "oklch(0.80 0.13 85)",                // gold
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
      heroOverlay: {
        enabled: true,
        backgroundColor: "oklch(0.18 0.03 150)",
        opacity: 0.3,
      },
    },
  },

  // ─── VALENTINE'S ROMANCE ────────────────────────────────────────────────────
  "valentine": {
    label: "Valentine's Romance",
    description: "Blush pink + deep rose + gold. Soft, romantic, intimate.",
    settings: {
      colors: {
        background: "oklch(0.95 0.02 350)",          // blush pink
        foreground: "oklch(0.25 0.04 350)",
        card: "oklch(0.98 0.015 350)",
        cardForeground: "oklch(0.25 0.04 350)",
        primary: "oklch(0.55 0.20 350)",              // deep rose
        primaryForeground: "oklch(0.98 0.015 350)",
        secondary: "oklch(0.90 0.025 350)",
        secondaryForeground: "oklch(0.30 0.04 350)",
        accent: "oklch(0.75 0.13 85)",                // gold
        accentForeground: "oklch(0.25 0.04 350)",
        muted: "oklch(0.92 0.02 350)",
        mutedForeground: "oklch(0.50 0.03 350)",
        border: "oklch(0.88 0.025 350)",
        destructive: "oklch(0.55 0.20 350)",
        ring: "oklch(0.55 0.20 350)",
      },
      radius: "0.5rem", // soft rounded corners
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
      heroOverlay: {
        enabled: false,
        backgroundColor: "oklch(0.95 0.02 350)",
        opacity: 0.2,
      },
    },
  },

  // ─── END OF SEASON ──────────────────────────────────────────────────────────
  "end-of-season": {
    label: "End of Season Sale",
    description: "Autumn orange + brown + cream. Warm, harvest-ready clearance vibes.",
    settings: {
      colors: {
        background: "oklch(0.95 0.02 70)",           // cream
        foreground: "oklch(0.22 0.03 50)",
        card: "oklch(0.98 0.015 70)",
        cardForeground: "oklch(0.22 0.03 50)",
        primary: "oklch(0.55 0.16 50)",               // autumn orange
        primaryForeground: "oklch(0.98 0.015 70)",
        secondary: "oklch(0.88 0.025 70)",
        secondaryForeground: "oklch(0.28 0.03 50)",
        accent: "oklch(0.40 0.04 40)",                // brown
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
      heroOverlay: {
        enabled: false,
        backgroundColor: "oklch(0.95 0.02 70)",
        opacity: 0.2,
      },
    },
  },

  // ─── NEW YEAR SPARKLE ───────────────────────────────────────────────────────
  "new-year": {
    label: "New Year Sparkle",
    description: "Midnight blue + silver + gold. Glamorous, celebratory, premium.",
    settings: {
      colors: {
        background: "oklch(0.15 0.03 250)",          // midnight blue
        foreground: "oklch(0.95 0.01 80)",
        card: "oklch(0.20 0.03 250)",
        cardForeground: "oklch(0.95 0.01 80)",
        primary: "oklch(0.80 0.05 250)",              // silver-blue
        primaryForeground: "oklch(0.15 0.03 250)",
        secondary: "oklch(0.24 0.03 250)",
        secondaryForeground: "oklch(0.95 0.01 80)",
        accent: "oklch(0.82 0.13 85)",                // gold
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
      heroOverlay: {
        enabled: true,
        backgroundColor: "oklch(0.15 0.03 250)",
        opacity: 0.35,
      },
    },
  },
};

// ─── Helper: apply festival theme to :root ────────────────────────────────────

export function applyFestivalTheme(settings: FestivalThemeSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Apply color overrides
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

  // Mark that a festival theme is active (used by FestivalBanner to show)
  root.setAttribute("data-festival", "active");
}

export function clearFestivalTheme() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Remove all inline overrides
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
}
