"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Truck, Shield, RefreshCw, Award, Sparkles, MapPin, Mail, Phone, Clock, Scissors, Leaf, Users, Newspaper, Briefcase, Ruler } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

const PAGES: Record<string, {
  title: string;
  subtitle: string;
  image: string;
  sections: { heading: string; body: string; icon?: any }[];
  cta?: { label: string; action: string };
}> = {
  "our-story": {
    title: "Our Story",
    subtitle: "Three generations of Florentine tailoring, reimagined for the modern world.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80",
    sections: [
      { heading: "The Beginning", body: "MAISON ÉLÉGANCE was founded in 1987 in a small atelier on Via dei Servi, Florence. What began as a single tailor's workshop — crafting bespoke coats for local aristocrats — has grown into a globally recognized maison, while remaining true to its founding principle: that every piece should be crafted to outlast trends, and likely, its owner.", icon: Sparkles },
      { heading: "The Philosophy", body: "We believe in quiet luxury — the kind that doesn't shout from billboards but whispers through hand-padded lapels, saddle-stitched leather, and the weight of 19-momme silk. Our pieces are designed to be worn for decades, repaired for generations, and passed down as heirlooms. This is fashion as permanence, not as consumption.", icon: Award },
      { heading: "The Ateliers", body: "Today, we operate ateliers in Florence (tailoring), Como (silk), Marche (footwear), and Vigevano (leather goods). Each atelier is led by a master artisan with an average of 27 years of experience. We do not outsource. We do not compromise. Every piece that carries our name was made by hands we know, in a workshop we've stood in.", icon: MapPin },
      { heading: "The Future", body: "As we look to the next generation, we're investing in sustainable materials, AI-powered styling, and direct relationships with our clients. But the core remains unchanged: exceptional materials, master craftsmanship, and the quiet confidence that comes from wearing something truly well-made.", icon: Leaf },
    ],
    cta: { label: "Explore the Collection", action: "shop" },
  },
  "craftsmanship": {
    title: "Craftsmanship",
    subtitle: "Every MAISON piece is hand-crafted by master artisans using techniques passed down through generations.",
    image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1920&q=80",
    sections: [
      { heading: "Hand-Padded Canvas", body: "Our tailored jackets use half-canvas construction — the canvas is hand-padded to the chest piece using 3,500+ individual stitches. This allows the jacket to mold to the wearer's body over time, creating a fit that machine-made garments cannot replicate. The process takes 18 hours per jacket.", icon: Scissors },
      { heading: "Saddle Stitching", body: "Our leather goods are saddle-stitched by hand using two needles and a single thread. Unlike machine lock-stitching, a broken saddle stitch won't unravel. Each Mira tote takes 12 hours to stitch, with edges painted in seven layers and burnished by hand for a glass-smooth finish.", icon: Award },
      { heading: "Hand-Welted Footwear", body: "The Verona boot uses hand-welting — a 200-step process that predates the Goodyear welt. A single rib of leather is stitched directly to the insole, creating a boot that can be resoled indefinitely. Our master cordwainer has 35+ years of experience and personally completes each pair.", icon: Shield },
      { heading: "Bias-Cut Silk", body: "Our silk dresses are cut on the bias — a technique that consumes 40% more fabric than straight cutting but creates the signature fluid drape. Our seamstresses in Como have over 25 years of experience cutting silk on the bias. The result is a dress that moves like liquid light.", icon: Sparkles },
    ],
    cta: { label: "Shop Handcrafted Pieces", action: "shop" },
  },
  "sustainability": {
    title: "Sustainability",
    subtitle: "Luxury that doesn't cost the Earth. We source with intention and build to last.",
    image: "https://images.unsplash.com/photo-1485231183935-fffde7cc051e?auto=format&fit=crop&w=1920&q=80",
    sections: [
      { heading: "Traceable Materials", body: "100% of our materials are traceable to source. Our wool comes from RWS-certified non-mulesed sheep in Italy. Our cashmere is grade-A Mongolian, certified by The Good Cashmere Standard. Our linen is European Flax® certified, grown without irrigation in Normandy.", icon: Leaf },
      { heading: "Made to Last", body: "A hand-welted boot can last 30+ years with resoling. A half-canvas suit can be relined and re-tailored indefinitely. By designing for permanence, we reject the fast-fashion model of planned obsolescence. One MAISON coat replaces twenty disposable ones.", icon: Shield },
      { heading: "Lifetime Repairs", body: "Every MAISON piece includes lifetime repairs. Send it back to our atelier at any time — we'll restitch, resole, re-line, or re-button at no cost (you only pay shipping). This keeps pieces in use and out of landfills.", icon: RefreshCw },
      { heading: "Certified Facilities", body: "Our ateliers are GOTS-certified and powered by 100% renewable energy. We use closed-loop water systems for dyeing, recycling 95% of process water. Our packaging is FSC-certified and fully recyclable.", icon: Check },
    ],
    cta: { label: "Shop Sustainable Pieces", action: "shop" },
  },
  "ateliers": {
    title: "Our Ateliers",
    subtitle: "Visit the workshops where every MAISON piece is born.",
    image: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=1920&q=80",
    sections: [
      { heading: "Florence — Tailoring Atelier", body: "Via dei Servi 12, Florence. Our founding atelier, led by Master Tailor Roberto Bianchi. Here, our wool coats, suits, and tailored pieces are hand-constructed over 18+ hours per garment. Visits by appointment — book through your personal stylist.", icon: MapPin },
      { heading: "Como — Silk Atelier", body: "Via Milano 45, Como. Led by Master Seamstress Elena Rossi. Our silk dresses, blouses, and scarves are bias-cut and hand-finished here, using 19-momme charmeuse from the oldest silk mill in Como, founded in 1457.", icon: MapPin },
      { heading: "Marche — Footwear Atelier", body: "Corso Garibaldi 8, Marche. Led by Master Cordwainer Marco Conti. Our hand-welted boots and shoes are crafted in this 4-person workshop using techniques that predate the Industrial Revolution.", icon: MapPin },
      { heading: "Vigevano — Leather Goods", body: "Piazza Duomo 15, Vigevano. Led by Master Leatherworker Sofia Romano. Our bags, wallets, and belts are saddle-stitched here using full-grain vegetable-tanned leather from the Tannery District of Tuscany.", icon: MapPin },
    ],
    cta: { label: "Book an Atelier Visit", action: "contact" },
  },
  "careers": {
    title: "Careers",
    subtitle: "Join a maison where craftsmanship meets innovation.",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1920&q=80",
    sections: [
      { heading: "Our Culture", body: "We are a team of 47 people across 4 ateliers and 3 offices. We value craftsmanship over speed, quality over quantity, and the quiet confidence that comes from doing something exceptionally well. If you believe in these values, we'd love to hear from you.", icon: Users },
      { heading: "Open Positions", body: "We're currently seeking: Master Tailor (Florence), Digital Marketing Manager (Paris), Client Care Specialist (Remote), AI Engineer (Remote), and Atelier Apprentice (Como). Send your CV and a cover letter telling us why craftsmanship matters to you.", icon: Briefcase },
      { heading: "Apprenticeship Program", body: "Our 3-year apprenticeship program trains the next generation of master artisans. You'll work alongside a master, learning hand-welting, saddle-stitching, and canvas construction. Applications open annually in September. No prior experience required — only dedication.", icon: Scissors },
    ],
    cta: { label: "Send Your Application", action: "contact" },
  },
  "press": {
    title: "Press",
    subtitle: "MAISON ÉLÉGANCE in the media.",
    image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1920&q=80",
    sections: [
      { heading: "Vogue Italia", body: "\"MAISON ÉLÉGANCE represents the vanguard of quiet luxury — pieces that don't need logos to signal their worth.\" — Vogue Italia, January 2026", icon: Newspaper },
      { heading: "Financial Times", body: "\"In an era of disposable fashion, MAISON ÉLÉGANCE's commitment to lifetime repairs and hand-craftsmanship is quietly revolutionary.\" — Financial Times, How To Spend It, November 2025", icon: Newspaper },
      { heading: "GQ Style", body: "\"The Camille coat is the kind of investment piece that makes fast fashion look like the waste it is.\" — GQ Style, Autumn 2025", icon: Newspaper },
      { heading: "Press Inquiries", body: "For press kits, samples, or interview requests, please contact our PR team. We respond within 24 hours and can arrange atelier visits, master tailor interviews, and behind-the-scenes photography.", icon: Mail },
    ],
    cta: { label: "Contact Press Team", action: "contact" },
  },
  "shipping-returns": {
    title: "Shipping & Returns",
    subtitle: "Complimentary express shipping and 30-day returns on every order.",
    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1920&q=80",
    sections: [
      { heading: "Complimentary Express Shipping", body: "All orders over $250 ship free via express delivery (1-2 business days). Orders under $250 ship for $25 (express) or $12 (standard, 3-5 days). Overnight delivery is $35. All orders ship from our Florence warehouse with tracking.", icon: Truck },
      { heading: "30-Day Free Returns", body: "Not in love? Return any item within 30 days for a full refund — no questions asked. Gold tier members enjoy 60 days, Platinum members 90 days. Use the prepaid return label included with every order. Refunds process within 3-5 business days.", icon: RefreshCw },
      { heading: "International Shipping", body: "We ship to 80+ countries including US, UK, EU, India, UAE, Japan, Australia, and Canada. Duties and taxes are calculated at checkout — no surprise charges on delivery. Most international orders arrive within 3-7 business days.", icon: MapPin },
      { heading: "Lifetime Repairs", body: "Every MAISON piece includes lifetime repairs. If a button falls off, a seam loosens, or a sole wears through — send it back. We'll repair it at no cost (you only pay shipping). This is our commitment to pieces that last generations.", icon: Shield },
    ],
  },
  "size-guide": {
    title: "Size Guide",
    subtitle: "Find your perfect fit with our detailed size charts and fit notes.",
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1920&q=80",
    sections: [
      { heading: "How We Size", body: "Our pieces run true to size. For a tailored fit, take your usual size. For a relaxed look, size up by one. Each product page includes specific fit notes from our master tailors — read these carefully, as fit varies by garment type.", icon: Ruler },
      { heading: "Top Size Chart", body: "XS: 32-34\" chest | S: 36-38\" | M: 38-40\" | L: 40-42\" | XL: 42-44\" | XXL: 44-46\". For tailored jackets, measure your chest under the arms and add 4\" for the jacket's intended ease.", icon: Ruler },
      { heading: "Bottom Size Chart", body: "XS: 26-28\" waist | S: 28-30\" | M: 30-32\" | L: 32-34\" | XL: 34-36\" | XXL: 36-38\". Our selvedge denim starts snug and stretches 3-5% with wear — take your usual size.", icon: Ruler },
      { heading: "Footwear Size Chart", body: "Our hand-welted boots and sneakers run true to US sizing. If between sizes, take the larger. Width is standard D. Wide feet should size up by half. View the Size Finder on each product page for a personalized recommendation.", icon: Ruler },
    ],
    cta: { label: "Try the Size Finder", action: "shop" },
  },
  "product-care": {
    title: "Product Care",
    subtitle: "How to keep your MAISON pieces looking their best for decades.",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1920&q=80",
    sections: [
      { heading: "Wool & Cashmere", body: "Dry clean only by a specialist in natural fibres — once per season at most. Store on a broad wooden hanger. Steam gently to refresh and remove wrinkles. Never iron directly. Brush with a soft clothes brush after each wear to remove dust and restore the nap.", icon: RefreshCw },
      { heading: "Silk", body: "Hand wash cold with silk-safe detergent, or dry clean. Hang to dry away from direct sunlight. Iron on silk setting through a pressing cloth. Store in a breathable garment bag — never in plastic, which traps moisture.", icon: Sparkles },
      { heading: "Leather", body: "Wipe with a soft dry cloth. Condition every 3-6 months with a neutral leather balm. Avoid prolonged exposure to direct sunlight and water. Patina will develop naturally with use — this is a feature, not a flaw. Store in the dust bag provided.", icon: Shield },
      { heading: "Footwear", body: "Use shoe trees after every wear. Condition monthly with a neutral leather cream. Polish with wax for shine. Resole every 2-3 years depending on wear. Never wear the same pair two days in a row — leather needs 24 hours to rest.", icon: Award },
    ],
  },
  "lifetime-repairs": {
    title: "Lifetime Repairs",
    subtitle: "Every MAISON piece is backed by our lifetime repair guarantee.",
    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1920&q=80",
    sections: [
      { heading: "What's Covered", body: "Everything. If a button falls off, a seam loosens, a sole wears through, a zipper breaks, or a lining tears — we'll repair it. There is no expiration date. There is no limit on the number of repairs. This is our commitment to pieces that last generations.", icon: Shield },
      { heading: "How It Works", body: "Simply email repairs@maison-elegance.com with your order number and a photo of the issue. We'll send you a prepaid shipping label. Your piece travels to the appropriate atelier (Florence for tailoring, Marche for footwear, Vigevano for leather goods), is repaired by the original artisan when possible, and returned to you within 2-3 weeks.", icon: RefreshCw },
      { heading: "What's Not Covered", body: "Normal wear and patina (which is beautiful, not damage). Modifications you've made yourself (take it to us first!). Damage from misuse (don't machine-wash a wool coat). Shipping costs to send the item to us (the return is on us).", icon: Check },
      { heading: "The Philosophy", body: "We believe that luxury brands have a responsibility to the pieces they create. If we made it, we should be willing to fix it — forever. This keeps our craftsmanship in circulation and out of landfills. It's better for you, better for the planet, and better for the artisans whose work deserves to be maintained.", icon: Leaf },
    ],
    cta: { label: "Request a Repair", action: "contact" },
  },
  "personal-stylist": {
    title: "Personal Stylist",
    subtitle: "One-on-one styling sessions with our expert stylists — complimentary for all members.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=1920&q=80",
    sections: [
      { heading: "Complimentary Consultations", body: "Every MAISON member can book a 30-minute virtual styling session with one of our expert stylists. Whether you're building a capsule wardrobe, preparing for a special occasion, or simply want advice on fit — our stylists are here to help, at no cost.", icon: Sparkles },
      { heading: "What to Expect", body: "Your stylist will ask about your lifestyle, preferences, and current wardrobe. They'll recommend pieces from our collection that complement what you already own, suggest complete looks for specific occasions, and advise on sizing and fit. Sessions can be conducted via video call or in-person at our Florence atelier.", icon: Users },
      { heading: "AI-Powered Styling", body: "In addition to human stylists, our AI Stylist (Camille) is available 24/7 via the concierge chat. Ask about outfit recommendations, styling advice, or what to wear for a specific occasion. Camille can curate complete looks and add them to your bag in one click.", icon: Sparkles },
      { heading: "Booking", body: "Gold tier members can book up to 2 sessions per month. Platinum members get unlimited sessions and a dedicated stylist. Silver members can book 1 session per quarter. To book, simply message us via the concierge chat or email stylist@maison-elegance.com.", icon: Mail },
    ],
    cta: { label: "Chat with Camille AI", action: "chat" },
  },
  "contact": {
    title: "Contact Us",
    subtitle: "We're here to help — reach us anytime, in any language.",
    image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1920&q=80",
    sections: [
      { heading: "Client Care", body: "Our client care team is available Monday–Friday, 9am–8pm CET, and Saturday 10am–6pm CET. We respond to all inquiries within 4 hours during business hours, and within 24 hours on weekends.", icon: Clock },
      { heading: "Email", body: "For general inquiries: hello@maison-elegance.com\nFor order support: orders@maison-elegance.com\nFor repairs: repairs@maison-elegance.com\nFor press: press@maison-elegance.com\nFor careers: careers@maison-elegance.com", icon: Mail },
      { heading: "Phone", body: "+39 055 1234 567 (Florence HQ)\n+1 415 555 0142 (US toll-free)\n+44 20 7946 0958 (UK)\n+91 22 6123 4567 (India)", icon: Phone },
      { heading: "Visit Us", body: "Florence Atelier: Via dei Servi 12, 50122 Firenze, Italy\nParis Showroom: 18 Rue du Faubourg Saint-Honoré, 75008 Paris, France\nTokyo Office: 3-5-2 Ginza, Chuo-ku, Tokyo 104-0061, Japan", icon: MapPin },
    ],
    cta: { label: "Chat with Us Now", action: "chat" },
  },
};

export function InfoPage({ pageId }: { pageId: string }) {
  const { setView } = useStore();
  const page = PAGES[pageId];

  if (!page) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl mb-3">Page not found</h1>
        <Button onClick={() => setView("home")} className="rounded-none mt-6">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img src={page.image} alt={page.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
        <div className="relative h-full flex items-end mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white max-w-2xl"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("home")}
              className="text-white/70 hover:text-white mb-4 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="font-serif text-4xl lg:text-6xl leading-tight text-balance">
              {page.title}
            </h1>
            <p className="text-white/80 mt-4 text-lg text-pretty max-w-xl">
              {page.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
        <div className="space-y-16">
          {page.sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="grid sm:grid-cols-[60px_1fr] gap-4 lg:gap-8"
            >
              {section.icon && (
                <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                  <section.icon className="h-5 w-5 text-accent" />
                </div>
              )}
              <div>
                <h2 className="font-serif text-2xl lg:text-3xl mb-4">
                  {section.heading}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                  {section.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        {page.cta && (
          <div className="text-center mt-16">
            <Button
              onClick={() => {
                if (page.cta!.action === "shop") setView("shop");
                else if (page.cta!.action === "contact") setView("home");
                else if (page.cta!.action === "chat") {
                  // Scroll to bottom to find concierge
                  if (typeof window !== "undefined") {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                  }
                }
              }}
              className="rounded-none h-12 px-8 text-sm tracking-wide-luxe uppercase"
            >
              {page.cta.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
