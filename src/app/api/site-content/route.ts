import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSiteContentTable } from "@/lib/ensure-tables";

// Default content for each section. Used when no DB row exists yet
// (e.g. fresh install). Mirrors the hardcoded values that were in the
// components so the homepage looks identical until admin customizes.
const DEFAULTS: Record<string, any> = {
  heroCarousel: {
    slides: [
      {
        image:
          "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80",
        season: "Autumn / Winter 2026",
        title: "The Art of",
        titleAccent: "Quiet Luxury.",
        description: "Handcrafted pieces from the world's finest ateliers.",
        ctaLabel: "Explore Collection",
        ctaLink: "shop",
      },
      {
        image:
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&q=80",
        season: "The Leather Edit",
        title: "Crafted to",
        titleAccent: "Outlast Trends.",
        description: "Italian leather goods, handmade in Florence.",
        ctaLabel: "Shop Leather",
        ctaLink: "Accessories",
      },
      {
        image:
          "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=1920&q=80",
        season: "Limited Edition",
        title: "Wearable",
        titleAccent: "Sculptures.",
        description: "Architectural silhouettes in raw silk and cashmere.",
        ctaLabel: "View Lookbook",
        ctaLink: "lookbook",
      },
      {
        image:
          "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80",
        season: "Sustainable Luxe",
        title: "Conscious",
        titleAccent: "Elegance.",
        description: "Responsibly-sourced materials, transparently made.",
        ctaLabel: "Discover",
        ctaLink: "sustainability",
      },
      {
        image:
          "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1920&q=80",
        season: "New Arrivals",
        title: "The Winter",
        titleAccent: "Wardrobe.",
        description: "Layers of warmth. Touches of gold.",
        ctaLabel: "Shop New",
        ctaLink: "shop",
      },
    ],
  },
  lookbook: {
    title: "The Lookbook",
    subtitle: "Styled stories from our atelier",
    items: [
      {
        image:
          "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
        title: "Atelier No. 1",
        subtitle: "The Trench Coat",
      },
      {
        image:
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
        title: "Atelier No. 2",
        subtitle: "Leather Stories",
      },
      {
        image:
          "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=800&q=80",
        title: "Atelier No. 3",
        subtitle: "Evening Silk",
      },
    ],
  },
  exploreMaison: {
    title: "Explore the Maison",
    subtitle: "Begin your journey into our world",
    items: [
      {
        image:
          "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
        title: "Our Story",
        description: "Three generations of artisans.",
        ctaLink: "our-story",
      },
      {
        image:
          "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
        title: "Craftsmanship",
        description: "From sketch to final stitch.",
        ctaLink: "craftsmanship",
      },
      {
        image:
          "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
        title: "Sustainability",
        description: "Luxury with a conscience.",
        ctaLink: "sustainability",
      },
    ],
  },
  followWorld: {
    title: "Follow Our World",
    subtitle: "@maisonelegance",
    items: [
      {
        image:
          "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80",
        caption: "Behind the seams",
        link: "#",
      },
      {
        image:
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80",
        caption: "Florence atelier",
        link: "#",
      },
      {
        image:
          "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=600&q=80",
        caption: "The new collection",
        link: "#",
      },
      {
        image:
          "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=600&q=80",
        caption: "Winter layers",
        link: "#",
      },
    ],
  },
  atelierCircle: {
    title: "The Atelier Circle Awaits",
    subtitle: "Membership",
    description:
      "Join our inner circle for early access to collections, private appointments, and bespoke alterations.",
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80",
    benefits: [
      "Early access to new collections 48 hours before launch",
      "Complimentary bespoke alterations",
      "Private styling appointments in Paris, Florence, or Tokyo",
      "Invitations to atelier events and runway previews",
      "Annual gift from the atelier",
    ],
    ctaLabel: "Become a Member",
  },
  newThisSeason: {
    title: "New This Season",
    subtitle: "Fresh arrivals from the atelier",
  },
  flashSale: {
    title: "The Private Sale",
    subtitle: "Up to 40% off selected pieces",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    badge: "40% OFF",
    enabled: true,
  },
  announcement: {
    text: "Complimentary shipping & returns worldwide — Limited time",
    link: "shop",
    enabled: true,
  },
};

function readSection(section: string, data: string | null) {
  if (!data) return DEFAULTS[section] || null;
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULTS[section] || null;
  }
}

// GET /api/site-content — public, returns all sections
// GET /api/site-content?section=heroCarousel — returns just one section
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const single = searchParams.get("section");

  try {
    // Auto-create the table if it doesn't exist yet (self-healing)
    await ensureSiteContentTable();

    if (single) {
      const row = await db.siteContent.findUnique({
        where: { section: single },
      });
      return NextResponse.json({
        section: single,
        data: readSection(single, row?.data || null),
      });
    }

    const rows = await db.siteContent.findMany();
    const all: Record<string, any> = {};
    // Start with defaults
    for (const section of Object.keys(DEFAULTS)) {
      all[section] = DEFAULTS[section];
    }
    // Override with DB values
    for (const row of rows) {
      all[row.section] = readSection(row.section, row.data);
    }
    return NextResponse.json({ sections: all });
  } catch (e: any) {
    // DB not available — return defaults so the site still works
    return NextResponse.json({ sections: DEFAULTS });
  }
}

export { DEFAULTS };
