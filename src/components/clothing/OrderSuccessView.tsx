"use client";

import { motion } from "framer-motion";
import { Check, Package, ArrowRight, Truck, Mail } from "lucide-react";
import { useSession } from "next-auth/react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function OrderSuccessView() {
  const { lastOrderId, setView } = useStore();
  const { data: session } = useSession();
  const userName = (session?.user as any)?.name || "Valued Client";
  const email = (session?.user as any)?.email || "your registered email";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:py-24 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="w-20 h-20 mx-auto rounded-full bg-accent flex items-center justify-center mb-8"
      >
        <Check className="h-10 w-10 text-accent-foreground" strokeWidth={3} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
          Order Confirmed
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl mb-4">
          Thank you, {userName.split(" ")[0]}.
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-2">
          Your order has been confirmed and will be hand-prepared by our
          atelier team.
        </p>
        <p className="text-sm text-muted-foreground mb-10">
          Order number:{" "}
          <span className="font-mono font-medium text-foreground">
            {lastOrderId}
          </span>
        </p>

        {/* Status timeline */}
        <div className="bg-secondary/30 p-8 rounded-sm mb-10 text-left">
          <h3 className="font-serif text-xl mb-6 text-center">What happens next</h3>
          <div className="space-y-6">
            {[
              {
                icon: Check,
                title: "Order Confirmed",
                desc: "We've received your order and payment.",
                done: true,
              },
              {
                icon: Package,
                title: "Hand-Prepared",
                desc: "Our atelier team will prepare your pieces within 24 hours.",
              },
              {
                icon: Truck,
                title: "Shipped",
                desc: "You'll receive a tracking number via email once shipped.",
              },
              {
                icon: Mail,
                title: "Delivered",
                desc: "Your order arrives in 2-4 business days.",
              },
            ].map((step, i) => (
              <div key={step.title} className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    step.done
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <step.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 pt-1.5">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => setView("profile")}
            className="rounded-none h-12 px-8 text-sm tracking-wide-luxe uppercase"
          >
            View My Orders
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            onClick={() => setView("shop")}
            variant="outline"
            className="rounded-none h-12 px-8 text-sm tracking-wide-luxe uppercase"
          >
            Continue Shopping
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-10">
          A confirmation email has been sent to {email}
        </p>
      </motion.div>
    </div>
  );
}
