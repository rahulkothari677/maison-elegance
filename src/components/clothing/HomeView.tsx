"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Truck, Shield, RefreshCw, Sparkles, Star } from "lucide-react";
import { products, heroImages, getProductById } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./ProductCard";
import { FlashSaleSection } from "./FlashSale";
import { HeroCarousel } from "./HeroCarousel";
import { useRef } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export function HomeView() {
  const { setView, setCategory, openProduct, lastViewedProductIds } = useStore();
  const lookbookRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: lookbookRef,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  const newArrivals = products.filter((p) => p.badge === "New" || p.badge === "Bestseller").slice(0, 4);
  const featured = products.slice(0, 8);
  const heroFeatured = products.find((p) => p.id === "p1")!;
  const collectionLeft = products.find((p) => p.id === "p2")!;
  const collectionRight = products.find((p) => p.id === "p9")!;
  const recentlyViewed = lastViewedProductIds
    .map((id) => getProductById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 6);

  // Personalized recommendations — based on categories the user has browsed
  // Pick items from the same categories as recently viewed, excluding already-viewed
  const browsedCategories = new Set(
    recentlyViewed.map((p) => p.category)
  );
  const recommendations = recentlyViewed.length > 0
    ? products
        .filter(
          (p) =>
            browsedCategories.has(p.category) &&
            !lastViewedProductIds.includes(p.id)
        )
        .sort(() => 0.5 - Math.random())
        .slice(0, 4)
    : [];

  return (
    <motion.div initial="hidden" animate="show" variants={stagger}>
      {/* HERO CAROUSEL — multiple images with dynamic transitions */}
      <HeroCarousel />

      {/* Trust badges */}
      <motion.section
        variants={fadeUp}
        className="border-b border-border"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: Truck, title: "Complimentary Shipping", desc: "On all orders over $250" },
              { icon: RefreshCw, title: "30-Day Returns", desc: "Free, no questions asked" },
              { icon: Shield, title: "Lifetime Repairs", desc: "On every MAISON piece" },
              { icon: Sparkles, title: "Atelier Quality", desc: "Handcrafted in Europe" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-accent shrink-0" />
                <div>
                  <p className="text-sm font-medium leading-tight">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ANIMATED STATS */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "39", suffix: " yrs", label: "Of Craftsmanship" },
              { value: "8", suffix: "", label: "Master Ateliers" },
              { value: "100", suffix: "%", label: "Hand-Finished" },
              { value: "12K", suffix: "+", label: "Happy Clients" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="font-serif text-4xl lg:text-5xl text-accent">
                  {stat.value}
                  <span className="text-2xl">{stat.suffix}</span>
                </p>
                <p className="text-[11px] tracking-wide-luxe uppercase text-primary-foreground/60 mt-2">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories grid */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-20 lg:py-28">
        <motion.div variants={fadeUp} className="text-center mb-12 lg:mb-16">
          <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
            Curated Categories
          </p>
          <h2 className="font-serif text-4xl lg:text-5xl text-balance">
            Explore the Maison
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {/* Large feature card */}
          <motion.button
            variants={fadeUp}
            onClick={() => {
              setCategory("outerwear");
              setView("shop");
            }}
            className="group relative md:row-span-2 aspect-[3/4] md:aspect-auto overflow-hidden rounded-sm text-left"
          >
            <img
              src={heroImages.editorial1}
              alt="Outerwear collection"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-white">
              <p className="text-[10px] tracking-luxe uppercase text-white/70 mb-2">
                Italian Wool · Cashmere
              </p>
              <h3 className="font-serif text-3xl lg:text-4xl mb-2">Outerwear</h3>
              <p className="text-white/80 text-sm mb-4 max-w-xs">
                Coats and jackets tailored to outlast a generation.
              </p>
              <span className="inline-flex items-center gap-2 text-sm border-b border-white/40 pb-1 group-hover:gap-3 transition-all">
                Discover <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </motion.button>

          {/* Two smaller cards */}
          <motion.button
            variants={fadeUp}
            onClick={() => {
              setCategory("women");
              setView("shop");
            }}
            className="group relative aspect-[3/4] md:aspect-[4/3] overflow-hidden rounded-sm text-left"
          >
            <img
              src={heroImages.editorial2}
              alt="Women collection"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="text-[10px] tracking-luxe uppercase text-white/70 mb-2">
                Silk · Cashmere · Linen
              </p>
              <h3 className="font-serif text-2xl lg:text-3xl">Women</h3>
              <span className="inline-flex items-center gap-2 text-sm mt-2 group-hover:gap-3 transition-all">
                Discover <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </motion.button>

          <motion.button
            variants={fadeUp}
            onClick={() => {
              setCategory("men");
              setView("shop");
            }}
            className="group relative aspect-[3/4] md:aspect-[4/3] overflow-hidden rounded-sm text-left"
          >
            <img
              src={heroImages.editorial3}
              alt="Men collection"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="text-[10px] tracking-luxe uppercase text-white/70 mb-2">
                Tailoring · Knitwear · Denim
              </p>
              <h3 className="font-serif text-2xl lg:text-3xl">Men</h3>
              <span className="inline-flex items-center gap-2 text-sm mt-2 group-hover:gap-3 transition-all">
                Discover <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </motion.button>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
        <motion.div
          variants={fadeUp}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
              Just Arrived
            </p>
            <h2 className="font-serif text-4xl lg:text-5xl">New This Season</h2>
          </div>
          <Button
            variant="link"
            onClick={() => {
              setCategory("All");
              setView("shop");
            }}
            className="text-sm tracking-wide-luxe uppercase text-foreground hover:text-accent hidden sm:flex"
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>

        <motion.div
          variants={stagger}
          className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6"
        >
          {newArrivals.map((p) => (
            <motion.div key={p.id} variants={fadeUp}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FLASH SALE */}
      <FlashSaleSection />

      {/* Editorial Split */}
      <section className="bg-secondary/40 border-y border-border">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div variants={fadeUp} className="order-2 lg:order-1">
              <p className="text-[11px] tracking-luxe uppercase text-accent mb-4">
                The Atelier
              </p>
              <h2 className="font-serif text-4xl lg:text-5xl leading-tight text-balance">
                Three generations of Florentine tailoring.
              </h2>
              <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                Every MAISON ÉLÉGANCE piece begins in our Florence atelier,
                where master tailors with an average of 27 years of experience
                translate sketches into garments that will outlive trends — and
                likely, their owners.
              </p>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                We work exclusively with mills that have been in operation for
                over a century, sourcing the finest Italian wool, French linen,
                and Mongolian cashmere. Each garment carries a story you can
                feel.
              </p>
              <div className="grid grid-cols-3 gap-6 mt-10">
                {[
                  ["39", "Years of craft"],
                  ["8", "Master ateliers"],
                  ["100%", "Hand-finished"],
                ].map(([num, label]) => (
                  <div key={label}>
                    <p className="font-serif text-4xl text-accent">{num}</p>
                    <p className="text-xs text-muted-foreground mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setView("shop")}
                className="mt-10 rounded-none h-12 px-8 text-sm tracking-wide-luxe uppercase"
              >
                Discover the Collection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="order-1 lg:order-2 grid grid-cols-2 gap-4"
            >
              <img
                src={collectionLeft.images[0]}
                alt={collectionLeft.name}
                className="w-full aspect-[3/4] object-cover rounded-sm"
              />
              <img
                src={collectionRight.images[0]}
                alt={collectionRight.name}
                className="w-full aspect-[3/4] object-cover rounded-sm mt-8"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-20 lg:py-28">
        <motion.div
          variants={fadeUp}
          className="text-center mb-12 lg:mb-16"
        >
          <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
            The Edit
          </p>
          <h2 className="font-serif text-4xl lg:text-5xl text-balance">
            Pieces We Love This Season
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6"
        >
          {featured.slice(0, 8).map((p) => (
            <motion.div key={p.id} variants={fadeUp}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonial */}
      <motion.section
        variants={fadeUp}
        className="bg-primary text-primary-foreground"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10 py-24 text-center">
          <p className="text-[11px] tracking-luxe uppercase text-accent mb-6">
            Client Story
          </p>
          <blockquote className="font-serif text-3xl lg:text-4xl leading-snug text-balance">
            &ldquo;I bought my first MAISON coat twelve years ago. It still
            looks as good as the day I walked out of the Florence atelier.
            This is what luxury should mean.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-3 mt-8">
            <img
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80"
              alt="Camille Dubois"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="text-left">
              <p className="font-medium">Camille Dubois</p>
              <p className="text-xs text-primary-foreground/60">
                Architect, Paris · Client since 2014
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* LOOKBOOK — Editorial Parallax */}
      <section
        ref={lookbookRef}
        className="relative overflow-hidden bg-background"
      >
        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-20 lg:py-32">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-14 lg:mb-20"
          >
            <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
              The Lookbook · A/W 2026
            </p>
            <h2 className="font-serif text-4xl lg:text-6xl text-balance">
              The Poetry of Quiet Detail
            </h2>
            <p className="text-muted-foreground mt-5 max-w-2xl mx-auto text-lg text-pretty">
              An editorial study of texture, drape, and the kind of craftsmanship
              that reveals itself slowly — to those who know where to look.
            </p>
          </motion.div>

          <div className="grid grid-cols-12 gap-4 lg:gap-6">
            {/* Tall left image */}
            <motion.div
              style={{ y: y1 }}
              className="col-span-12 md:col-span-5 row-span-2"
            >
              <button
                onClick={() => openProduct("p1")}
                className="block w-full h-full group relative overflow-hidden rounded-sm aspect-[3/4]"
              >
                <img
                  src={heroImages.editorial1}
                  alt="Editorial 1"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                  <p className="text-[10px] tracking-luxe uppercase text-white/70 mb-1">
                    Chapter One
                  </p>
                  <p className="font-serif text-2xl lg:text-3xl">The Tailored Coat</p>
                  <p className="text-sm text-white/80 mt-1">
                    Italian wool-cashmere, Florence atelier
                  </p>
                </div>
              </button>
            </motion.div>

            {/* Top right image */}
            <motion.div style={{ y: y2 }} className="col-span-12 md:col-span-7">
              <button
                onClick={() => openProduct("p2")}
                className="block w-full group relative overflow-hidden rounded-sm aspect-[16/9]"
              >
                <img
                  src={heroImages.editorial2}
                  alt="Editorial 2"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                  <p className="text-[10px] tracking-luxe uppercase text-white/70 mb-1">
                    Chapter Two
                  </p>
                  <p className="font-serif text-2xl lg:text-3xl">The Silk Slip</p>
                  <p className="text-sm text-white/80 mt-1">
                    19-momme charmeuse, bias-cut in Como
                  </p>
                </div>
              </button>
            </motion.div>

            {/* Bottom right — two side by side */}
            <motion.div style={{ y: y3 }} className="col-span-12 md:col-span-7 grid grid-cols-2 gap-4 lg:gap-6">
              <button
                onClick={() => openProduct("p9")}
                className="block w-full group relative overflow-hidden rounded-sm aspect-[3/4]"
              >
                <img
                  src={heroImages.editorial3}
                  alt="Editorial 3"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white text-left">
                  <p className="text-[9px] tracking-luxe uppercase text-white/70 mb-1">
                    Chapter Three
                  </p>
                  <p className="font-serif text-lg lg:text-xl">Hand-Welted Boots</p>
                </div>
              </button>
              <button
                onClick={() => openProduct("p5")}
                className="block w-full group relative overflow-hidden rounded-sm aspect-[3/4] bg-secondary"
              >
                <img
                  src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"
                  alt="Editorial 4"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white text-left">
                  <p className="text-[9px] tracking-luxe uppercase text-white/70 mb-1">
                    Chapter Four
                  </p>
                  <p className="font-serif text-lg lg:text-xl">Saddle-Stitched Leather</p>
                </div>
              </button>
            </motion.div>
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              onClick={() => {
                setCategory("All");
                setView("shop");
              }}
              variant="outline"
              className="rounded-none h-12 px-8 text-sm tracking-wide-luxe uppercase"
            >
              View Full Lookbook
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* PERSONALIZED RECOMMENDATIONS */}
      {recommendations.length > 0 && (
        <section className="border-t border-border bg-secondary/20">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-16 lg:py-20">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="flex items-end justify-between mb-10"
            >
              <div>
                <p className="text-[11px] tracking-luxe uppercase text-accent mb-2">
                  Curated for You
                </p>
                <h2 className="font-serif text-3xl lg:text-4xl">
                  Based on Your Browsing
                </h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                  Pieces that match your recent interests — handpicked from
                  categories you've explored.
                </p>
              </div>
              <Button
                variant="link"
                onClick={() => setView("shop")}
                className="text-sm tracking-wide-luxe uppercase hover:text-accent hidden sm:flex"
              >
                Browse All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div
              variants={stagger}
              className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6"
            >
              {recommendations.map((p) => (
                <motion.div key={p.id} variants={fadeUp}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* RECENTLY VIEWED */}
      {recentlyViewed.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-16 lg:py-20">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="flex items-end justify-between mb-8"
            >
              <div>
                <p className="text-[11px] tracking-luxe uppercase text-accent mb-2">
                  Pick up where you left off
                </p>
                <h2 className="font-serif text-3xl lg:text-4xl">Recently Viewed</h2>
              </div>
              <Button
                variant="link"
                onClick={() => setView("shop")}
                className="text-sm tracking-wide-luxe uppercase hover:text-accent hidden sm:flex"
              >
                Browse All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {recentlyViewed.map((p) => (
                <div key={p.id} className="w-[220px] sm:w-[260px] shrink-0">
                  <button
                    onClick={() => openProduct(p.id)}
                    className="block w-full text-left group"
                  >
                    <div className="aspect-[3/4] overflow-hidden rounded-sm bg-muted mb-3">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <p className="text-[10px] tracking-luxe uppercase text-muted-foreground">
                      {p.brand}
                    </p>
                    <p className="font-serif text-sm line-clamp-1 group-hover:text-accent transition-colors">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      <span className="text-xs text-muted-foreground">
                        {p.rating} · ${p.price.toLocaleString()}
                      </span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LIFESTYLE GRID — Instagram-style visual mosaic */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-16 lg:py-20">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
              @maison.elegance
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl">Follow Our World</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Behind the seams — atelier visits, new arrivals, and styling inspiration
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1485231183935-fffde7cc051e?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80",
            ].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 6) * 0.05 }}
                className="aspect-square overflow-hidden rounded-sm group cursor-pointer relative"
              >
                <img
                  src={img}
                  alt={`Lifestyle ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-xs tracking-wide-luxe uppercase transition-opacity">
                    View
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Button
              variant="outline"
              className="rounded-none h-11 px-6 text-sm tracking-wide-luxe uppercase"
            >
              Follow @maison.elegance
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <motion.section
        variants={fadeUp}
        className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-20 lg:py-28"
      >
        <div className="relative overflow-hidden rounded-sm">
          <img
            src={heroImages.tertiary}
            alt="Discover the collection"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative px-8 py-20 lg:px-16 lg:py-28 text-center text-white">
            <p className="text-[11px] tracking-luxe uppercase text-white/80 mb-4">
              Become a Member
            </p>
            <h2 className="font-serif text-4xl lg:text-6xl text-balance">
              The Atelier Circle Awaits
            </h2>
            <p className="text-white/80 mt-5 max-w-xl mx-auto text-lg text-pretty">
              Members earn points on every order, receive complimentary
              shipping, and access private events at our Florence atelier.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-9">
              <Button
                size="lg"
                onClick={() => setView("profile")}
                className="rounded-none bg-white text-black hover:bg-white/90 h-12 px-8 text-sm tracking-wide-luxe uppercase"
              >
                Join Now
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setView("shop")}
                className="rounded-none bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white h-12 px-8 text-sm tracking-wide-luxe uppercase"
              >
                Browse Collection
              </Button>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
