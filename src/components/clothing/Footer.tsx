"use client";

import { useState } from "react";
import { Instagram, Twitter, Facebook, Youtube, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Footer() {
  const { setView, setCategory } = useStore();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Welcome to the Atelier Circle", {
      description: "You'll receive 10% off your first order shortly.",
    });
    setEmail("");
  };

  const goTo = (cat: string) => {
    setCategory(cat);
    setView("shop");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="mt-auto bg-primary text-primary-foreground">
      {/* Newsletter */}
      <div className="border-b border-primary-foreground/10">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
                The Atelier Circle
              </p>
              <h2 className="font-serif text-3xl lg:text-4xl leading-tight text-balance">
                Join our inner circle for early access to collections and
                private events.
              </h2>
              <p className="text-primary-foreground/70 mt-4 max-w-lg">
                Members receive 10% off the first order, complimentary shipping
                on every order, and invitations to private atelier visits.
              </p>
            </div>
            <form
              onSubmit={handleSubscribe}
              className="flex w-full max-w-md lg:ml-auto"
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="rounded-none bg-primary-foreground/5 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 focus-visible:ring-0 focus-visible:border-accent"
              />
              <Button
                type="submit"
                className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90 px-6"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
          <div className="col-span-2 lg:col-span-2">
            <p className="font-serif text-2xl tracking-wide">MAISON ÉLÉGANCE</p>
            <p className="text-[10px] tracking-luxe uppercase text-primary-foreground/50 mt-1">
              Paris · Florence · Tokyo
            </p>
            <p className="text-sm text-primary-foreground/70 mt-5 max-w-sm leading-relaxed">
              Premium apparel and accessories, handcrafted by master artisans
              since 1987. Each piece carries the quiet confidence of true
              craftsmanship.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="w-9 h-9 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-accent hover:border-accent hover:text-accent-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] tracking-luxe uppercase text-primary-foreground/50 mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                ["Women", "Women"],
                ["Men", "Men"],
                ["Outerwear", "Outerwear"],
                ["Footwear", "Footwear"],
                ["Accessories", "Accessories"],
              ].map(([label, cat]) => (
                <li key={cat}>
                  <button
                    onClick={() => goTo(cat)}
                    className="text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] tracking-luxe uppercase text-primary-foreground/50 mb-4">
              Maison
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                "Our Story",
                "Craftsmanship",
                "Sustainability",
                "Ateliers",
                "Careers",
                "Press",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] tracking-luxe uppercase text-primary-foreground/50 mb-4">
              Client Care
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                "Shipping & Returns",
                "Size Guide",
                "Product Care",
                "Lifetime Repairs",
                "Personal Stylist",
                "Contact",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] tracking-luxe uppercase text-primary-foreground/50 mb-4">
              Account
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => {
                    setView("profile");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  My Account
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setView("orders");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Order History
                </button>
              </li>
              {["Loyalty Program", "Address Book", "Sign Out"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setView("profile");
                    }}
                    className="text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/50">
          <p>© 2026 MAISON ÉLÉGANCE. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-accent transition-colors">
              Privacy Policy
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-accent transition-colors">
              Terms of Service
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-accent transition-colors">
              Cookies
            </a>
          </div>
          <p className="tracking-wide-luxe uppercase">Crafted in Italy</p>
        </div>
      </div>
    </footer>
  );
}
