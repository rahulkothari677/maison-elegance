"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Sparkles, Check, ArrowRight, Heart, Shuffle } from "lucide-react";
import { useStore } from "@/lib/store";
import { products } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function SubscriptionBox() {
  const { openProduct } = useStore();
  const [step, setStep] = useState<"intro" | "profile" | "active">("intro");
  const [profile, setProfile] = useState({
    style: "classic",
    budget: 500,
    sizes: { top: "M", bottom: "M", shoe: "9" },
    preferences: [] as string[],
  });

  const styles = [
    { id: "classic", label: "Classic", desc: "Timeless, tailored, refined" },
    { id: "modern", label: "Modern", desc: "Clean lines, contemporary cuts" },
    { id: "casual", label: "Relaxed", desc: "Effortless, comfortable, easy" },
    { id: "bold", label: "Statement", desc: "Bold colors, distinctive pieces" },
  ];

  const preferences = [
    "Outerwear", "Knitwear", "Dresses", "Shirts", "Denim",
    "Leather Goods", "Footwear", "Accessories", "Suiting", "Sustainable",
  ];

  const togglePref = (pref: string) => {
    setProfile((p) => ({
      ...p,
      preferences: p.preferences.includes(pref)
        ? p.preferences.filter((x) => x !== pref)
        : [...p.preferences, pref],
    }));
  };

  // Mock curated box — pick 3 products based on preferences
  const curatedBox = products
    .filter((p) => {
      if (profile.preferences.length === 0) return true;
      return profile.preferences.some((pref) =>
        p.category.toLowerCase().includes(pref.toLowerCase()) ||
        p.subcategory.toLowerCase().includes(pref.toLowerCase()) ||
        (pref === "Sustainable" && p.badge === "Sustainable")
      );
    })
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  const subscribe = async () => {
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "subscribe", plan: "monthly", styleProfile: profile }),
      });
      const data = await res.json();
      toast.success(data.message);
      setStep("active");
    } catch {
      toast.error("Failed to subscribe");
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-4">
          <Package className="h-3.5 w-3.5 text-accent" />
          <span className="text-[11px] tracking-wide-luxe uppercase text-accent font-medium">
            Monthly Curated Box
          </span>
        </div>
        <h1 className="font-serif text-4xl lg:text-5xl">The Atelier Box</h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          A monthly box of handpicked pieces based on your style profile.
          Keep what you love, return what you don't. $250/month, cancel anytime.
        </p>
      </motion.div>

      {step === "intro" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
          {/* How it works */}
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { icon: Sparkles, title: "1. Set Your Style", desc: "Tell us your preferences — style, sizes, budget, categories you love" },
              { icon: Package, title: "2. Receive Your Box", desc: "3 handpicked pieces arrive on the 1st of each month via express shipping" },
              { icon: Heart, title: "3. Keep or Return", desc: "Keep what you love (charged at member price), return the rest for free" },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-3">
                  <step.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-serif text-lg mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Benefits */}
          <div className="border border-border rounded-sm p-6 mb-8 bg-secondary/20">
            <h3 className="font-serif text-xl mb-4">What's Included</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "3 handpicked pieces each month",
                "20% member discount on kept items",
                "Free returns on unkept items",
                "AI-curated based on your style profile",
                "Priority access to new collections",
                "Skip any month, cancel anytime",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-accent shrink-0" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={() => setStep("profile")}
              className="rounded-none h-14 px-10 text-sm tracking-wide-luxe uppercase"
            >
              Start Your Style Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              $250/month · No commitment · Cancel anytime
            </p>
          </div>
        </motion.div>
      )}

      {step === "profile" && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto space-y-8">
          {/* Style picker */}
          <div>
            <h3 className="font-serif text-xl mb-4">Your Style</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {styles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setProfile({ ...profile, style: s.id })}
                  className={cn(
                    "p-4 border-2 rounded-sm text-left transition-all",
                    profile.style === s.id
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/50"
                  )}
                >
                  <p className="font-medium text-sm">{s.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <h3 className="font-serif text-xl mb-4">Monthly Budget</h3>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="150"
                max="1000"
                step="50"
                value={profile.budget}
                onChange={(e) => setProfile({ ...profile, budget: parseInt(e.target.value) })}
                className="flex-1 accent-accent"
              />
              <span className="font-serif text-xl w-20 text-right">${profile.budget}</span>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h3 className="font-serif text-xl mb-4">Categories You Love</h3>
            <div className="flex flex-wrap gap-2">
              {preferences.map((pref) => (
                <button
                  key={pref}
                  onClick={() => togglePref(pref)}
                  className={cn(
                    "px-4 py-2 text-sm border rounded-full transition-all",
                    profile.preferences.includes(pref)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary"
                  )}
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("intro")} className="rounded-sm">
              Back
            </Button>
            <Button onClick={subscribe} className="flex-1 rounded-none h-12 text-sm tracking-wide-luxe uppercase">
              <Sparkles className="h-4 w-4 mr-2" />
              Activate My Subscription — $250/month
            </Button>
          </div>
        </motion.div>
      )}

      {step === "active" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto">
          <div className="bg-accent/5 border border-accent/20 rounded-sm p-6 mb-8 text-center">
            <Check className="h-10 w-10 text-accent mx-auto mb-2" />
            <h3 className="font-serif text-2xl">Subscription Active!</h3>
            <p className="text-muted-foreground mt-1">
              Your first box ships on the 1st of next month. Here's a preview of what might be inside:
            </p>
          </div>

          {/* Preview box */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-xl">Your Curated Preview</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep("profile")}
              className="rounded-sm"
            >
              <Shuffle className="h-3.5 w-3.5 mr-1.5" />
              Update Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {curatedBox.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border border-border rounded-sm overflow-hidden cursor-pointer"
                onClick={() => openProduct(p.id)}
              >
                <img src={p.images[0]} alt={p.name} className="w-full aspect-[3/4] object-cover" />
                <div className="p-3">
                  <p className="font-serif text-sm line-clamp-1">{p.name}</p>
                  <p className="text-sm font-medium mt-1">${p.price.toLocaleString()}</p>
                  <p className="text-xs text-accent mt-1">Member price: ${Math.round(p.price * 0.8).toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => {
                toast.success("Subscription cancelled");
                setStep("intro");
              }}
              className="rounded-sm text-sm"
            >
              Cancel Subscription
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
