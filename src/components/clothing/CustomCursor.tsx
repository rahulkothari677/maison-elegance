"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState<"default" | "hover" | "grab" | "zoom">("default");
  const [hidden, setHidden] = useState(true);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 400, mass: 0.3 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Only enable on desktop with fine pointer
    const mq = window.matchMedia("(pointer: fine)");
    if (!mq.matches) return;
    Promise.resolve().then(() => setEnabled(true));

    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX - 12);
      cursorY.set(e.clientY - 12);
      setHidden(false);

      // Detect what element we're hovering
      const el = e.target as HTMLElement;
      if (el.closest("button, a, [role=button], [data-cursor=hover]")) {
        setVariant("hover");
      } else if (el.closest("img[data-cursor=zoom], [data-cursor=zoom]")) {
        setVariant("zoom");
      } else if (el.closest("[data-cursor=grab]")) {
        setVariant("grab");
      } else {
        setVariant("default");
      }
    };

    const leave = () => setHidden(true);

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
    };
  }, [cursorX, cursorY]);

  if (!enabled) return null;

  const sizes = {
    default: 24,
    hover: 36,
    grab: 32,
    zoom: 40,
  };

  const size = sizes[variant];

  return (
    <motion.div
      style={{
        x,
        y,
        width: size,
        height: size,
        borderColor: "var(--accent)",
        backgroundColor: variant === "hover" ? "color-mix(in srgb, var(--accent) 15%, transparent)" : "transparent",
        opacity: hidden ? 0 : 0.7,
      }}
      animate={{
        width: size,
        height: size,
        opacity: hidden ? 0 : 0.7,
      }}
      transition={{ duration: 0.2 }}
      className="fixed top-0 left-0 z-[9999] pointer-events-none rounded-full border-2 flex items-center justify-center"
    >
      {variant === "zoom" && (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      )}
    </motion.div>
  );
}
