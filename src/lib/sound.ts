"use client";

import { useStore } from "@/lib/store";

type SoundType = "add-to-cart" | "wishlist" | "navigate" | "success" | "hover" | "toggle";

const SOUND_FREQS: Record<SoundType, { freq: number; duration: number; type: OscillatorType; volume: number }> = {
  "add-to-cart": { freq: 660, duration: 0.15, type: "sine", volume: 0.08 },
  "wishlist": { freq: 880, duration: 0.12, type: "sine", volume: 0.06 },
  "navigate": { freq: 440, duration: 0.08, type: "sine", volume: 0.04 },
  "success": { freq: 523, duration: 0.2, type: "sine", volume: 0.08 },
  "hover": { freq: 1000, duration: 0.04, type: "sine", volume: 0.02 },
  "toggle": { freq: 550, duration: 0.06, type: "triangle", volume: 0.04 },
};

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  // Resume if suspended (browsers auto-suspend until user interaction)
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSound(type: SoundType) {
  // Check store for sound preference
  const { soundEnabled } = useStore.getState();
  if (!soundEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const config = SOUND_FREQS[type];
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = config.freq;
  oscillator.type = config.type;

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(config.volume, ctx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + config.duration);
}
