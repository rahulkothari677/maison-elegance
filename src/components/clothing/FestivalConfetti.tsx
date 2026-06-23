"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FestivalConfetti — fires a confetti burst when triggered.
 * Uses pure CSS animations for performance. 80 colorful pieces.
 *
 * Colors match the active festival theme for cohesion.
 */

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
  shape: "square" | "circle" | "triangle";
};

const THEME_COLORS: Record<string, string[]> = {
  "black-friday": ["#FF1744", "#FFD700", "#FFFFFF", "#FF6B6B"],
  "diwali": ["#FFD700", "#FF8C00", "#FF6347", "#FFA500"],
  "christmas": ["#228B22", "#8B0000", "#FFD700", "#FFFFFF", "#DC143C"],
  "valentine": ["#FF6B9D", "#FF1493", "#FFC0CB", "#FF69B4", "#FFD700"],
  "end-of-season": ["#D2691E", "#CD853F", "#8B4513", "#FFA500", "#FFD700"],
  "new-year": ["#FFD700", "#C0C0C0", "#FFFFFF", "#4169E1", "#FF1493"],
};

export function FestivalConfetti({
  trigger,
  themeName,
}: {
  trigger: number; // increment to fire
  themeName: string;
}) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const colors = THEME_COLORS[themeName] || THEME_COLORS["black-friday"];
    const newPieces: ConfettiPiece[] = Array.from({ length: 80 }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 10,
      rotation: Math.random() * 360,
      shape: (["square", "circle", "triangle"] as const)[Math.floor(Math.random() * 3)],
    }));
    setPieces(newPieces);
    const timer = setTimeout(() => setPieces([]), 5000);
    return () => clearTimeout(timer);
  }, [trigger, themeName]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-20px",
            width: `${p.size}px`,
            height: p.shape === "triangle" ? "0" : `${p.size}px`,
            background: p.shape === "triangle" ? "transparent" : p.color,
            borderRadius: p.shape === "circle" ? "50%" : "0",
            borderLeft: p.shape === "triangle" ? `${p.size / 2}px solid transparent` : undefined,
            borderRight: p.shape === "triangle" ? `${p.size / 2}px solid transparent` : undefined,
            borderBottom: p.shape === "triangle" ? `${p.size}px solid ${p.color}` : undefined,
            animation: `confetti-fall ${p.duration}s ease-in forwards`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
