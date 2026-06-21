"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ruler, User, Loader2, Check, ArrowRight, ArrowLeft } from "lucide-react";
import type { SizeOption } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Fit = "slim" | "regular" | "relaxed";

export function SizeFinder({
  sizes,
  onPick,
}: {
  sizes: SizeOption[];
  onPick: (size: SizeOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [fit, setFit] = useState<Fit>("regular");
  const [recommendation, setRecommendation] = useState<SizeOption | null>(null);
  const [calculating, setCalculating] = useState(false);

  const reset = () => {
    setStep(1);
    setHeight("");
    setWeight("");
    setFit("regular");
    setRecommendation(null);
  };

  const calculate = () => {
    setCalculating(true);
    setTimeout(() => {
      const h = parseInt(height) || 170;
      const w = parseInt(weight) || 70;
      // Simple size recommendation algorithm
      // BMI-based with fit adjustment
      const bmi = w / Math.pow(h / 100, 2);
      let baseSize: SizeOption = "M";
      if (bmi < 18.5) baseSize = "XS";
      else if (bmi < 21) baseSize = "S";
      else if (bmi < 24) baseSize = "M";
      else if (bmi < 28) baseSize = "L";
      else if (bmi < 32) baseSize = "XL";
      else baseSize = "XXL";

      // Adjust for fit preference
      const sizeOrder: SizeOption[] = ["XS", "S", "M", "L", "XL", "XXL"];
      const idx = sizeOrder.indexOf(baseSize);
      let adjustedIdx = idx;
      if (fit === "slim" && idx > 0) adjustedIdx = idx - 1; // size down for slim
      if (fit === "relaxed" && idx < sizeOrder.length - 1)
        adjustedIdx = idx + 1; // size up for relaxed

      let recommended = sizeOrder[adjustedIdx];

      // If the product doesn't have the recommended size, pick the closest available
      const availableSizes = sizes.filter((s) => s !== "ONE SIZE");
      if (availableSizes.length === 0) {
        recommended = sizes[0];
      } else if (!availableSizes.includes(recommended)) {
        // Find closest available
        const recIdx = sizeOrder.indexOf(recommended);
        let closest = availableSizes[0];
        let closestDist = Math.abs(
          sizeOrder.indexOf(closest as SizeOption) - recIdx
        );
        for (const s of availableSizes) {
          const dist = Math.abs(sizeOrder.indexOf(s) - recIdx);
          if (dist < closestDist) {
            closest = s;
            closestDist = dist;
          }
        }
        recommended = closest;
      }

      setRecommendation(recommended);
      setCalculating(false);
      setStep(4);
    }, 1200);
  };

  const fitOptions: { id: Fit; label: string; desc: string }[] = [
    { id: "slim", label: "Slim", desc: "Close to body, tailored" },
    { id: "regular", label: "Regular", desc: "Standard fit, not too tight" },
    { id: "relaxed", label: "Relaxed", desc: "Loose, roomy fit" },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <button className="text-xs text-muted-foreground hover:text-accent inline-flex items-center gap-1.5 transition-colors">
          <Ruler className="h-3.5 w-3.5" />
          Size Finder
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-accent" />
            Find Your Perfect Size
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-[280px]">
          <AnimatePresence mode="wait">
            {/* Step 1: Height */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center py-4">
                  <p className="text-[11px] tracking-luxe uppercase text-accent mb-2">
                    Step 1 of 3
                  </p>
                  <p className="font-serif text-lg">How tall are you?</p>
                </div>
                <div>
                  <Label className="text-xs mb-2 block">Height (cm)</Label>
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g. 175"
                    className="rounded-sm text-center text-lg h-14"
                    autoFocus
                  />
                  <input
                    type="range"
                    min={140}
                    max={210}
                    value={parseInt(height) || 170}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full mt-3 accent-accent"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>140 cm</span>
                    <span>210 cm</span>
                  </div>
                </div>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!height}
                  className="w-full rounded-sm h-11"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Weight */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center py-4">
                  <p className="text-[11px] tracking-luxe uppercase text-accent mb-2">
                    Step 2 of 3
                  </p>
                  <p className="font-serif text-lg">What's your weight?</p>
                </div>
                <div>
                  <Label className="text-xs mb-2 block">Weight (kg)</Label>
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 70"
                    className="rounded-sm text-center text-lg h-14"
                    autoFocus
                  />
                  <input
                    type="range"
                    min={40}
                    max={140}
                    value={parseInt(weight) || 70}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full mt-3 accent-accent"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>40 kg</span>
                    <span>140 kg</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="rounded-sm h-11"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!weight}
                    className="flex-1 rounded-sm h-11"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Fit preference */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center py-4">
                  <p className="text-[11px] tracking-luxe uppercase text-accent mb-2">
                    Step 3 of 3
                  </p>
                  <p className="font-serif text-lg">Preferred fit?</p>
                </div>
                <div className="space-y-2">
                  {fitOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setFit(opt.id)}
                      className={cn(
                        "w-full text-left p-4 border-2 rounded-sm transition-all",
                        fit === opt.id
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{opt.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {opt.desc}
                          </p>
                        </div>
                        {fit === opt.id && (
                          <Check className="h-4 w-4 text-accent" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="rounded-sm h-11"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={calculate}
                    disabled={calculating}
                    className="flex-1 rounded-sm h-11"
                  >
                    {calculating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        Find My Size
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Result */}
            {step === 4 && recommendation && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center py-4"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-accent/15 flex items-center justify-center">
                  <span className="font-serif text-3xl text-accent">
                    {recommendation === "ONE SIZE" ? "OS" : recommendation}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] tracking-luxe uppercase text-accent mb-1">
                    Your recommended size
                  </p>
                  <p className="font-serif text-2xl">
                    Size {recommendation === "ONE SIZE" ? "One Size" : recommendation}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto">
                    Based on {height} cm, {weight} kg, {fit} fit. We recommend
                    this size for the best fit on you.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={reset}
                    variant="outline"
                    className="rounded-sm flex-1 h-11"
                  >
                    Retake
                  </Button>
                  <Button
                    onClick={() => {
                      onPick(recommendation);
                      setOpen(false);
                    }}
                    className="rounded-sm flex-1 h-11"
                  >
                    Use This Size
                    <Check className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        {step < 4 && (
          <div className="flex justify-center gap-1.5 pt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1 rounded-full transition-all",
                  s === step ? "w-8 bg-accent" : "w-2 bg-muted"
                )}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
