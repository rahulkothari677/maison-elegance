"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Package,
  Truck,
  Home,
  Clock,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TRACKING_STAGES = [
  {
    status: "Confirmed",
    label: "Order Confirmed",
    desc: "We've received your order and payment",
    icon: CheckCircle2,
  },
  {
    status: "Processing",
    label: "Hand-Prepared",
    desc: "Our atelier team is preparing your pieces",
    icon: Clock,
  },
  {
    status: "Shipped",
    label: "Shipped",
    desc: "Your order is on its way",
    icon: Package,
  },
  {
    status: "Out for Delivery",
    label: "Out for Delivery",
    desc: "Your package is with the courier today",
    icon: Truck,
  },
  {
    status: "Delivered",
    label: "Delivered",
    desc: "Your order has arrived",
    icon: Home,
  },
];

export function OrderTimeline({
  status,
  trackingNumber,
  createdAt,
}: {
  status: string;
  trackingNumber?: string | null;
  createdAt: string;
}) {
  const currentStageIndex = TRACKING_STAGES.findIndex(
    (s) => s.status === status
  );
  const isCancelled = status === "Cancelled";

  if (isCancelled) {
    return (
      <div className="border border-destructive/30 bg-destructive/5 rounded-sm p-6 text-center">
        <p className="font-medium text-destructive">Order Cancelled</p>
        <p className="text-sm text-muted-foreground mt-1">
          This order was cancelled. Any charges will be refunded within 3-5
          business days.
        </p>
      </div>
    );
  }

  const progressPct =
    currentStageIndex >= 0
      ? (currentStageIndex / (TRACKING_STAGES.length - 1)) * 100
      : 0;

  return (
    <div className="border border-border rounded-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-wide-luxe uppercase text-muted-foreground">
            Order Timeline
          </p>
          <p className="font-serif text-lg mt-0.5">
            {currentStageIndex >= 0
              ? TRACKING_STAGES[currentStageIndex].label
              : "Processing"}
          </p>
        </div>
        {trackingNumber && (
          <div className="text-right">
            <p className="text-[10px] tracking-wide-luxe uppercase text-muted-foreground">
              Tracking #
            </p>
            <p className="font-mono text-sm mt-0.5">{trackingNumber}</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative mb-8">
        <div className="h-1 bg-muted rounded-full" />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-0 h-1 bg-accent rounded-full"
        />
        {/* Stage dots */}
        <div className="absolute top-0 left-0 right-0 flex justify-between -mt-1.5">
          {TRACKING_STAGES.map((stage, i) => {
            const isDone = i <= currentStageIndex;
            const isCurrent = i === currentStageIndex;
            return (
              <div
                key={stage.status}
                className={cn(
                  "w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center",
                  isDone
                    ? "bg-accent border-accent"
                    : "bg-background border-muted",
                  isCurrent && "ring-4 ring-accent/20 scale-125"
                )}
              >
                {isDone && (
                  <CheckCircle2 className="h-2.5 w-2.5 text-accent-foreground" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage details */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {TRACKING_STAGES.map((stage, i) => {
          const isDone = i <= currentStageIndex;
          const isCurrent = i === currentStageIndex;
          return (
            <div
              key={stage.status}
              className={cn(
                "text-center transition-opacity",
                isDone ? "opacity-100" : "opacity-40"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center transition-colors",
                  isCurrent
                    ? "bg-accent text-accent-foreground"
                    : isDone
                    ? "bg-accent/15 text-accent"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <stage.icon className="h-4 w-4" />
              </div>
              <p
                className={cn(
                  "text-xs font-medium",
                  isCurrent && "text-accent"
                )}
              >
                {stage.label}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 hidden sm:block">
                {stage.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Estimated delivery */}
      {currentStageIndex < TRACKING_STAGES.length - 1 && (
        <div className="mt-6 pt-6 border-t border-border flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-accent" />
          <span className="text-muted-foreground">Estimated delivery: </span>
          <span className="font-medium">
            {(() => {
              const d = new Date(createdAt);
              d.setDate(d.getDate() + 5);
              return d.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
            })()}
          </span>
        </div>
      )}
    </div>
  );
}
