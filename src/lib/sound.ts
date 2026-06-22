"use client";

import { useEffect, useRef, useCallback } from "react";

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
let muted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

export function playSound(type: SoundType) {
  if (muted) return;
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

export function setMuted(m: boolean) {
  muted = m;
}

export function isMuted() {
  return muted;
}

// React hook for sound
export function useSound() {
  return {
    play: playSound,
    muted,
    toggleMute: () => {
      muted = !muted;
      return muted;
    },
  };
}
