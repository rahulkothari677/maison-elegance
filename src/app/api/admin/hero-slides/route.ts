import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

// In-memory store for hero slides (would be DB in production)
// For now, we use a simple file-based approach via the filesystem
// The slides are also hardcoded in HeroCarousel.tsx as defaults

export async function GET() {
  // Return default slides — in production this would come from DB
  return NextResponse.json({
    slides: [
      {
        id: 1,
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80",
        season: "Autumn / Winter 2026",
        title: "The Art of",
        titleAccent: "Quiet Luxury.",
        description: "Handcrafted pieces from the world's finest ateliers.",
        ctaLabel: "Explore Collection",
        ctaLink: "shop",
      },
      // ... other slides
    ],
    note: "Hero slides are currently hardcoded in HeroCarousel.tsx. To customize, edit the slides array in src/components/clothing/HeroCarousel.tsx. A database-backed version will be available in a future update.",
  });
}
