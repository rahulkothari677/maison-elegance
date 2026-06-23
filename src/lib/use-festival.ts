"use client";

import { useState, useEffect } from "react";

/**
 * useFestivalActive — returns the active festival name (if any).
 * Used by product cards, hero sections, etc. to show festival-specific
 * overlays like floating "X% OFF" stamps.
 *
 * Caches the result in module-level state so we only fetch once.
 */

let cachedFestival: string | null | undefined = undefined;
const listeners = new Set<(v: string | null) => void>();

export function useFestivalActive(): string | null {
  const [festivalName, setFestivalName] = useState<string | null>(
    cachedFestival === undefined ? null : cachedFestival
  );

  useEffect(() => {
    if (cachedFestival !== undefined) {
      setFestivalName(cachedFestival);
      return;
    }

    let mounted = true;
    fetch("/api/festival-themes")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!mounted) return;
        const name = data?.theme?.name || null;
        cachedFestival = name;
        setFestivalName(name);
        listeners.forEach((fn) => fn(name));
      })
      .catch(() => {
        if (!mounted) return;
        cachedFestival = null;
        setFestivalName(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return festivalName;
}
