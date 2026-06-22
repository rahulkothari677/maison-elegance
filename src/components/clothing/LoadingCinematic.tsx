"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function LoadingCinematic() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: "var(--background)" }}
        >
          {/* Logo fade in */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-8"
          >
            <p className="font-serif text-2xl md:text-3xl tracking-wide leading-none" style={{ color: "var(--foreground)" }}>
              MAISON ÉLÉGANCE
            </p>
            <p className="text-[9px] tracking-luxe uppercase mt-2" style={{ color: "var(--muted-foreground)" }}>
              Paris · Florence · Tokyo
            </p>
          </motion.div>

          {/* Gold thread drawing across */}
          <div className="w-48 h-px relative overflow-hidden" style={{ background: "var(--border)" }}>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-0 left-0 h-full"
              style={{ background: "var(--accent)" }}
            />
          </div>

          {/* Subtle shimmer text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[10px] tracking-wide-luxe uppercase mt-6"
            style={{ color: "var(--muted-foreground)" }}
          >
            Curating your experience
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
