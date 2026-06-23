"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * FestivalSpinWheel — a popup that shows a spinning wheel where users
 * can win coupon codes. Appears once per session when a festival is active.
 *
 * The wheel has 8 segments with different prizes:
 * - 10% OFF, 15% OFF, 20% OFF, FREE SHIPPING, 25% OFF, 30% OFF,
 *   FREE GIFT, 50% OFF (jackpot)
 *
 * Each user gets 1 spin per day (stored in localStorage).
 */

const SEGMENTS = [
  { label: "10% OFF", code: "SAVE10", color: "#FF6B6B" },
  { label: "15% OFF", code: "SAVE15", color: "#4ECDC4" },
  { label: "FREE SHIP", code: "FREESHIP", color: "#FFE66D" },
  { label: "20% OFF", code: "SAVE20", color: "#A8E6CF" },
  { label: "FREE GIFT", code: "FREEGIFT", color: "#FF8B94" },
  { label: "25% OFF", code: "SAVE25", color: "#C7CEEA" },
  { label: "30% OFF", code: "SAVE30", color: "#FFD93D" },
  { label: "50% OFF", code: "JACKPOT50", color: "#FF1744" },
];

export function FestivalSpinWheel({ festivalName }: { festivalName: string }) {
  const [show, setShow] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<typeof SEGMENTS[0] | null>(null);
  const [copied, setCopied] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!festivalName) return;
    // Show popup after 5 seconds, once per day per user
    const key = `festival-spin-${festivalName}-${new Date().toDateString()}`;
    const alreadySpun = localStorage.getItem(key);
    if (alreadySpun) return;

    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, [festivalName]);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    // Pick a random segment
    const winningIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segmentAngle = 360 / SEGMENTS.length;
    // The pointer is at the top (0deg). We want the winning segment to land there.
    // Each segment center is at: index * segmentAngle + segmentAngle/2
    // To bring it to top (0deg), rotate by: 360 - (center) + extra full spins
    const targetAngle = 360 - (winningIndex * segmentAngle + segmentAngle / 2);
    const fullSpins = 5 + Math.floor(Math.random() * 3); // 5-7 full spins
    const finalRotation = rotation + fullSpins * 360 + targetAngle - (rotation % 360);

    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(SEGMENTS[winningIndex]);
      // Mark as spun for today
      const key = `festival-spin-${festivalName}-${new Date().toDateString()}`;
      localStorage.setItem(key, "1");
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
              <h3 className="font-serif text-2xl font-bold">Spin & Win!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                One free spin — win an exclusive festival coupon code
              </p>
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
                  background: `conic-gradient(${SEGMENTS.map((s, i) => {
                    const start = (i / SEGMENTS.length) * 360;
                    const end = ((i + 1) / SEGMENTS.length) * 360;
                    return `${s.color} ${start}deg ${end}deg`;
                  }).join(", ")})`,
                }}
              >
                {/* Segment labels */}
                {SEGMENTS.map((seg, i) => {
                  const angle = (i / SEGMENTS.length) * 360 + (360 / SEGMENTS.length) / 2;
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
