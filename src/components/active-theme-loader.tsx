"use client";

import { useActiveTheme } from "@/lib/use-theme-settings";

export function ActiveThemeLoader() {
  useActiveTheme();
  return null;
}
