"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFestivalActive } from "@/lib/use-festival";

/**
 * FestivalSounds — plays ambient festive background music when a festival
 * is active. Includes a toggle button (bottom-right corner) to mute/unmute.
 *
 * Uses the Web Audio API to generate simple festival tones programmatically
 * (no external audio files needed — works on any deployment).
 *
 * Music is OFF by default. User must click the speaker button to enable.
 * Choice is stored in localStorage so it persists across sessions.
 */

// Simple festival melody patterns (frequencies in Hz, durations in ms)
const MELODIES: Record<string, { freq: number; dur: number }[]> = {
  "black-friday": [
    { freq: 220, dur: 200 }, { freq: 277, dur: 200 }, { freq: 330, dur: 400 },
    { freq: 220, dur: 200 }, { freq: 277, dur: 200 }, { freq: 330, dur: 400 },
  ],
  "diwali": [
    { freq: 440, dur: 150 }, { freq: 523, dur: 150 }, { freq: 659, dur: 150 },
    { freq: 523, dur: 150 }, { freq: 440, dur: 300 },
  ],
  "christmas": [
    { freq: 330, dur: 300 }, { freq: 392, dur: 300 }, { freq: 330, dur: 300 },
    { freq: 392, dur: 300 }, { freq: 440, dur: 600 },
  ],
  "valentine": [
    { freq: 392, dur: 400 }, { freq: 440, dur: 400 }, { freq: 494, dur: 800 },
  ],
  "end-of-season": [
    { freq: 261, dur: 200 }, { freq: 294, dur: 200 }, { freq: 330, dur: 200 },
    { freq: 392, dur: 400 },
  ],
  "new-year": [
    { freq: 523, dur: 100 }, { freq: 659, dur: 100 }, { freq: 784, dur: 100 },
    { freq: 1047, dur: 300 },
  ],
};

export function FestivalSounds() {
  const festivalName = useFestivalActive();
  const [enabled, setEnabled] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Show the sound toggle button when a festival is active
  useEffect(() => {
    if (festivalName) {
      // Check if user previously enabled sound
      const stored = localStorage.getItem("festival-sound-enabled");
      if (stored === "true") {
        setEnabled(true);
      }
      setShowButton(true);
    } else {
      setShowButton(false);
      setEnabled(false);
      stopMusic();
    }
  }, [festivalName]);

  // Start/stop music when enabled changes
  useEffect(() => {
    if (enabled && festivalName) {
      startMusic();
    } else {
      stopMusic();
    }
    return () => stopMusic();
  }, [enabled, festivalName]);

  const startMusic = () => {
    if (typeof window === "undefined") return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const melody = MELODIES[festivalName!] || MELODIES["black-friday"];
      let noteIndex = 0;

      const playNote = () => {
        if (!audioCtxRef.current || !enabled) return;
        const note = melody[noteIndex % melody.length];
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = note.freq;
        oscillator.type = "sine";

        // Very low volume so it's ambient, not intrusive
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + note.dur / 1000);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + note.dur / 1000);

        noteIndex++;
      };

      // Play first note immediately
      playNote();
      // Schedule subsequent notes
      const noteDuration = (MELODIES[festivalName!] || MELODIES["black-friday"])[0].dur;
      intervalRef.current = setInterval(playNote, noteDuration);
    } catch (e) {
      console.warn("[FestivalSounds] Audio not available:", e);
    }
  };

  const stopMusic = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const toggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    localStorage.setItem("festival-sound-enabled", String(newValue));
  };

  if (!showButton) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      onClick={toggle}
      aria-label={enabled ? "Mute festival music" : "Play festival music"}
      className="fixed bottom-4 right-4 z-[70] w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
      style={{
        background: "var(--accent)",
        color: "var(--accent-foreground)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        animation: enabled ? "festival-glow 2s ease-in-out infinite" : undefined,
      }}
    >
      {enabled ? (
        <Volume2 className="h-5 w-5" />
      ) : (
        <VolumeX className="h-5 w-5" />
      )}
      {enabled && (
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="absolute -top-1 -right-1"
        >
          <Music className="h-3 w-3" />
        </motion.span>
      )}
    </motion.button>
  );
}
