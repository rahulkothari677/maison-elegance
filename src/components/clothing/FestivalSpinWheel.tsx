"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { SpinWheelSegment } from "@/lib/festival-themes";

/**
 * FestivalSpinWheel — a popup with a spinning wheel where users can win
 * coupon codes. Configurable via props (segments, probabilities, title).
 */

const DEFAULT_SEGMENTS: SpinWheelSegment[] = [
  { label: "10% OFF", code: "SAVE10", color: "#FF6B6B", probability: 20 },
  { label: "15% OFF", code: "SAVE15", color: "#4ECDC4", probability: 15 },
  { label: "FREE SHIP", code: "FREESHIP", color: "#FFE66D", probability: 20 },
  { label: "20% OFF", code: "SAVE20", color: "#A8E6CF", probability: 15 },
  { label: "FREE GIFT", code: "FREEGIFT", color: "#FF8B94", probability: 10 },
  { label: "25% OFF", code: "SAVE25", color: "#C7CEEA", probability: 10 },
  { label: "30% OFF", code: "SAVE30", color: "#FFD93D", probability: 8 },
  { label: "50% OFF", code: "JACKPOT50", color: "#FF1744", probability: 2 },
];

export function FestivalSpinWheel({
  festivalName,
  enabled = true,
  title = "Spin & Win!",
  subtitle = "One free spin — win an exclusive festival coupon code",
  spinOncePerDay = true,
  segments = DEFAULT_SEGMENTS,
}: {
  festivalName: string;
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  spinOncePerDay?: boolean;
  segments?: SpinWheelSegment[];
}) {
  const [show, setShow] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<SpinWheelSegment | null>(null);
  const [copied, setCopied] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!festivalName || !enabled) return;
    const key = `festival-spin-${festivalName}-${spinOncePerDay ? new Date().toDateString() : ""}`;
    if (spinOncePerDay) {
      const alreadySpun = localStorage.getItem(key);
      if (alreadySpun) return;
    }
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, [festivalName, enabled, spinOncePerDay]);

  if (!enabled) return null;

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    // Pick a winner based on probability weights
    const totalWeight = segments.reduce((sum, s) => sum + s.probability, 0);
    let random = Math.random() * totalWeight;
    let winningIndex = 0;
    for (let i = 0; i < segments.length; i++) {
      random -= segments[i].probability;
      if (random <= 0) {
        winningIndex = i;
        break;
      }
    }

    const segmentAngle = 360 / segments.length;
    const targetAngle = 360 - (winningIndex * segmentAngle + segmentAngle / 2);
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const finalRotation = rotation + fullSpins * 360 + targetAngle - (rotation % 360);

    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(segments[winningIndex]);
      const key = `festival-spin-${festivalName}-${spinOncePerDay ? new Date().toDateString() : ""}`;
      if (spinOncePerDay) {
        localStorage.setItem(key, "1");
      }
    }, 4000);
  };

  const copyCode = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.code);
    setCopied(true);
    toast.success(`Code copied: ${result.code}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const close = () => {
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
          }}
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            transition={{ type: "spring", damping: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-background rounded-lg p-6 sm:p-8 max-w-md w-full shadow-2xl border-2"
            style={{ borderColor: "var(--accent)" }}
          >
            <button
              onClick={close}
              className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center mb-6">
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
                style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
              >
                <Gift className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            </div>

            {/* The wheel */}
            <div className="relative mx-auto mb-6" style={{ width: "280px", height: "280px" }}>
              {/* Pointer */}
              <div
                className="absolute left-1/2 -translate-x-1/2 z-20"
                style={{ top: "-10px" }}
              >
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "12px solid transparent",
                    borderRight: "12px solid transparent",
                    borderTop: "20px solid var(--destructive)",
                  }}
                />
              </div>

              {/* Wheel */}
              <div
                ref={wheelRef}
                className="absolute inset-0 rounded-full overflow-hidden border-4 shadow-lg"
                style={{
                  borderColor: "var(--accent)",
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
                  background: `conic-gradient(${segments.map((s, i) => {
                    const start = (i / segments.length) * 360;
                    const end = ((i + 1) / segments.length) * 360;
                    return `${s.color} ${start}deg ${end}deg`;
                  }).join(", ")})`,
                }}
              >
                {/* Segment labels */}
                {segments.map((seg, i) => {
                  const angle = (i / segments.length) * 360 + (360 / segments.length) / 2;
                  return (
                    <div
                      key={i}
                      className="absolute left-1/2 top-1/2 origin-left"
                      style={{
                        transform: `rotate(${angle}deg) translateX(60px)`,
                        transformOrigin: "0 0",
                      }}
                    >
                      <span
                        className="text-[10px] font-bold uppercase whitespace-nowrap"
                        style={{
                          color: "#000",
                          textShadow: "0 1px 2px rgba(255,255,255,0.5)",
                          display: "inline-block",
                          transform: "translateY(-50%)",
                        }}
                      >
                        {seg.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Center hub */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full z-10 flex items-center justify-center font-bold text-xs"
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-foreground)",
                  border: "3px solid var(--background)",
                }}
              >
                SPIN
              </div>
            </div>

            {/* Result */}
            {result && !spinning ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-3"
              >
                <p className="text-sm text-muted-foreground">🎉 You won:</p>
                <div
                  className="inline-block px-6 py-3 rounded-sm font-mono font-bold text-lg tracking-wider"
                  style={{
                    background: "var(--accent)",
                    color: "var(--accent-foreground)",
                    border: "2px dashed var(--foreground)",
                  }}
                >
                  {result.code}
                </div>
                <p className="text-xs text-muted-foreground">
                  Use this code at checkout — {result.label}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={copyCode} size="sm" className="rounded-none">
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1.5" /> Copy Code
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={close}
                    size="sm"
                    variant="outline"
                    className="rounded-none"
                  >
                    Start Shopping
                  </Button>
                </div>
              </motion.div>
            ) : (
              <Button
                onClick={spin}
                disabled={spinning}
                className="w-full rounded-none h-12 text-sm tracking-wide-luxe uppercase"
              >
                {spinning ? "Spinning..." : "Spin the Wheel"}
              </Button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
