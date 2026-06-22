"use client";

import { useEffect, useState } from "react";

export type ThemeSettings = {
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  radius: string;
  fontSerif: string;
  fontSans: string;
};

export const DEFAULT_THEME: ThemeSettings = {
  primary: "#2c2418",
  primaryForeground: "#fbf7ed",
  accent: "#c19a45",
  accentForeground: "#2c2418",
  background: "#fbf7ed",
  foreground: "#2c2418",
  muted: "#f0ebe0",
  mutedForeground: "#75695a",
  border: "#e5dfd3",
  radius: "0.5rem",
  fontSerif: "Playfair Display, Georgia, serif",
  fontSans: "Inter, system-ui, sans-serif",
};

export const PRESET_THEMES: { name: string; settings: ThemeSettings }[] = [
  {
    name: "Ivory Classic",
    settings: DEFAULT_THEME,
  },
  {
    name: "Midnight Noir",
    settings: {
      primary: "#0d0d0d",
      primaryForeground: "#f5f5f0",
      accent: "#c19a45",
      accentForeground: "#0d0d0d",
      background: "#121212",
      foreground: "#f5f5f0",
      muted: "#1e1e1e",
      mutedForeground: "#999999",
      border: "#2a2a2a",
      radius: "0.25rem",
      fontSerif: "Playfair Display, Georgia, serif",
      fontSans: "Inter, system-ui, sans-serif",
    },
  },
  {
    name: "Rose Gold",
    settings: {
      primary: "#4a2c2a",
      primaryForeground: "#fdf5f0",
      accent: "#d4a5a5",
      accentForeground: "#4a2c2a",
      background: "#fdf5f0",
      foreground: "#4a2c2a",
      muted: "#f5e6e0",
      mutedForeground: "#8a6b65",
      border: "#e8d0c8",
      radius: "0.75rem",
      fontSerif: "Playfair Display, Georgia, serif",
      fontSans: "Inter, system-ui, sans-serif",
    },
  },
  {
    name: "Forest Sage",
    settings: {
      primary: "#1a2e1f",
      primaryForeground: "#f0f5ed",
      accent: "#7a9b6e",
      accentForeground: "#1a2e1f",
      background: "#f0f5ed",
      foreground: "#1a2e1f",
      muted: "#dfe8d8",
      mutedForeground: "#5a6b50",
      border: "#c5d4bc",
      radius: "0.5rem",
      fontSerif: "Playfair Display, Georgia, serif",
      fontSans: "Inter, system-ui, sans-serif",
    },
  },
  {
    name: "Ocean Blue",
    settings: {
      primary: "#0f2a3f",
      primaryForeground: "#eef4f8",
      accent: "#5b9bd5",
      accentForeground: "#0f2a3f",
      background: "#eef4f8",
      foreground: "#0f2a3f",
      muted: "#d8e5ee",
      mutedForeground: "#4a6578",
      border: "#bcd0de",
      radius: "0.5rem",
      fontSerif: "Playfair Display, Georgia, serif",
      fontSans: "Inter, system-ui, sans-serif",
    },
  },
  {
    name: "Royal Purple",
    settings: {
      primary: "#2d1b3d",
      primaryForeground: "#f5f0f8",
      accent: "#9b6dbf",
      accentForeground: "#2d1b3d",
      background: "#f5f0f8",
      foreground: "#2d1b3d",
      muted: "#e8d8f0",
      mutedForeground: "#6b5a78",
      border: "#d0bcd8",
      radius: "0.5rem",
      fontSerif: "Playfair Display, Georgia, serif",
      fontSans: "Inter, system-ui, sans-serif",
    },
  },
  {
    name: "Warm Terracotta",
    settings: {
      primary: "#3d2817",
      primaryForeground: "#faf3e8",
      accent: "#d4744a",
      accentForeground: "#faf3e8",
      background: "#faf3e8",
      foreground: "#3d2817",
      muted: "#f0e4d0",
      mutedForeground: "#8a6b50",
      border: "#e0d0b8",
      radius: "0.375rem",
      fontSerif: "Playfair Display, Georgia, serif",
      fontSans: "Inter, system-ui, sans-serif",
    },
  },
  {
    name: "Sleek Minimal",
    settings: {
      primary: "#111111",
      primaryForeground: "#ffffff",
      accent: "#111111",
      accentForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#111111",
      muted: "#f5f5f5",
      mutedForeground: "#888888",
      border: "#e5e5e5",
      radius: "0px",
      fontSerif: "Inter, system-ui, sans-serif",
      fontSans: "Inter, system-ui, sans-serif",
    },
  },
];

// Convert hex to oklch string (simplified — just use the hex directly since
// our CSS variables accept any valid CSS color)
function applyTheme(settings: ThemeSettings) {
  const root = document.documentElement;
  root.style.setProperty("--primary", settings.primary);
  root.style.setProperty("--primary-foreground", settings.primaryForeground);
  root.style.setProperty("--accent", settings.accent);
  root.style.setProperty("--accent-foreground", settings.accentForeground);
  root.style.setProperty("--background", settings.background);
  root.style.setProperty("--foreground", settings.foreground);
  root.style.setProperty("--muted", settings.muted);
  root.style.setProperty("--muted-foreground", settings.mutedForeground);
  root.style.setProperty("--border", settings.border);
  root.style.setProperty("--radius", settings.radius);
  root.style.setProperty("--font-serif", settings.fontSerif);
  root.style.setProperty("--font-sans", settings.fontSans);
}

export function useActiveTheme() {
  const [activeTheme, setActiveTheme] = useState<ThemeSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/themes/active")
      .then((r) => r.json())
      .then((data) => {
        if (data.theme?.settings) {
          applyTheme(data.theme.settings);
          setActiveTheme(data.theme.settings);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Also apply a local override (for live preview in admin)
  const applyLocalTheme = (settings: ThemeSettings) => {
    applyTheme(settings);
  };

  const resetTheme = () => {
    applyTheme(DEFAULT_THEME);
  };

  return { activeTheme, loading, applyLocalTheme, resetTheme };
}

export { applyTheme };
