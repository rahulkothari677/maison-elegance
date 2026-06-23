"use client";

import { useState, useEffect } from "react";

/**
 * useFestivalActive — returns the active festival name + settings (if any).
 * Used by product cards, hero sections, etc. to show festival-specific
 * overlays like floating "X% OFF" stamps and 3D tilt.
 *
 * Caches the result in module-level state so we only fetch once.
 */

type FestivalInfo = {
  name: string;
  settings: any;
} | null;

let cachedFestival: FestivalInfo = undefined;
const listeners = new Set<(v: FestivalInfo) => void>();

export function useFestivalActive(): FestivalInfo {
  const [festival, setFestival] = useState<FestivalInfo>(
    cachedFestival === undefined ? null : cachedFestival
  );

  useEffect(() => {
    if (cachedFestival !== undefined) {
      setFestival(cachedFestival);
      return;
    }

    let mounted = true;
    fetch("/api/festival-themes")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!mounted) return;
        const info: FestivalInfo = data?.theme
          ? { name: data.theme.name, settings: data.theme.settings }
          : null;
        cachedFestival = info;
        setFestival(info);
        listeners.forEach((fn) => fn(info));
      })
      .catch(() => {
        if (!mounted) return;
        cachedFestival = null;
        setFestival(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return festival;
}
