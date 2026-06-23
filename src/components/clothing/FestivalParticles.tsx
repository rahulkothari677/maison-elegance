"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FestivalParticles — animated particle effects that match the active theme.
 * - black-friday: red lightning sparks
 * - diwali: golden glowing sparkles
 * - christmas: white snowflakes
 * - valentine: pink hearts
 * - end-of-season: autumn leaves
 * - new-year: gold/silver fireworks
 *
 * Pure CSS animations for performance. Particles are generated once with
 * random positions/delays and never re-render.
 */
export function FestivalParticles({ themeName }: { themeName: string }) {
  const particles = useMemo(() => {
    const count = 30;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 12,
      size: 4 + Math.random() * 8,
      opacity: 0.4 + Math.random() * 0.5,
    }));
  }, []);

  const particleStyle = (p: any) => {
    const base: any = {
      left: `${p.left}%`,
      animationDelay: `${p.delay}s`,
      animationDuration: `${p.duration}s`,
      opacity: p.opacity,
    };
    return base;
  };

  // Render different shapes per theme
  const renderParticle = (p: any) => {
    switch (themeName) {
      case "christmas":
        // Snowflakes — white circles falling
        return (
          <div
            key={p.id}
            className="absolute rounded-full bg-white pointer-events-none"
            style={{
              ...particleStyle(p),
              width: `${p.size}px`,
              height: `${p.size}px`,
              animation: `snowfall ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
              boxShadow: "0 0 4px rgba(255,255,255,0.8)",
            }}
          />
        );

      case "diwali":
        // Golden sparkles / diya lights
        return (
          <div
            key={p.id}
            className="absolute pointer-events-none"
            style={{
              ...particleStyle(p),
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: "radial-gradient(circle, #FFD700 0%, #FF8C00 50%, transparent 70%)",
              borderRadius: "50%",
              animation: `diwali-float ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
              boxShadow: "0 0 8px #FFD700, 0 0 16px #FF8C00",
            }}
          />
        );

      case "black-friday":
        // Red lightning sparks
        return (
          <div
            key={p.id}
            className="absolute pointer-events-none"
            style={{
              ...particleStyle(p),
              width: `${p.size * 0.5}px`,
              height: `${p.size * 2}px`,
              background: "linear-gradient(to bottom, transparent, #FF1744, transparent)",
              animation: `spark ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
              boxShadow: "0 0 6px #FF1744",
            }}
          />
        );

      case "valentine":
        // Pink hearts floating up
        return (
          <div
            key={p.id}
            className="absolute pointer-events-none"
            style={{
              ...particleStyle(p),
              fontSize: `${p.size + 6}px`,
              color: "#FF6B9D",
              animation: `heart-float ${p.duration}s ease-in infinite`,
              animationDelay: `${p.delay}s`,
              textShadow: "0 0 8px rgba(255,107,157,0.6)",
            }}
          >
            ♥
          </div>
        );

      case "end-of-season":
        // Autumn leaves falling
        return (
          <div
            key={p.id}
            className="absolute pointer-events-none"
            style={{
              ...particleStyle(p),
              width: `${p.size}px`,
              height: `${p.size * 1.5}px`,
              background: ["#D2691E", "#CD853F", "#8B4513", "#A0522D"][p.id % 4],
              borderRadius: "50% 10% 50% 10%",
              animation: `leaf-fall ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        );

      case "new-year":
        // Gold/silver firework bursts
        return (
          <div
            key={p.id}
            className="absolute pointer-events-none"
            style={{
              ...particleStyle(p),
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.id % 2 === 0 ? "#FFD700" : "#C0C0C0",
              borderRadius: "50%",
              animation: `firework ${p.duration}s ease-out infinite`,
              animationDelay: `${p.delay}s`,
              boxShadow: `0 0 8px ${p.id % 2 === 0 ? "#FFD700" : "#C0C0C0"}`,
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[55] overflow-hidden"
      aria-hidden="true"
    >
      {particles.map(renderParticle)}
    </div>
  );
}
