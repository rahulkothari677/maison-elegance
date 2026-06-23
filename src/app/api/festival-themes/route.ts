import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureFestivalThemeTable } from "@/lib/ensure-tables";
import { FESTIVAL_PRESETS } from "@/lib/festival-themes";

/**
 * GET /api/festival-themes
 * Public endpoint — returns the currently active festival theme (if any).
 * Also handles auto-activation/deactivation based on startDate/endDate.
 */
export async function GET() {
  try {
    await ensureFestivalThemeTable();

    // Check for auto-activation/deactivation
    const now = new Date();
    const themes = await db.festivalTheme.findMany();

    for (const theme of themes) {
      // Auto-activate if startDate has passed and endDate hasn't
      if (
        !theme.isActive &&
        theme.startDate &&
        theme.endDate &&
        theme.startDate <= now &&
        theme.endDate > now
      ) {
        await db.festivalTheme.update({
          where: { id: theme.id },
          data: { isActive: true },
        });
        theme.isActive = true;
      }
      // Auto-deactivate if endDate has passed
      if (theme.isActive && theme.endDate && theme.endDate <= now) {
        await db.festivalTheme.update({
          where: { id: theme.id },
          data: { isActive: false },
        });
        theme.isActive = false;
      }
    }

    const activeTheme = themes.find((t) => t.isActive);

    if (!activeTheme) {
      return NextResponse.json({ theme: null });
    }

    let settings;
    try {
      settings = JSON.parse(activeTheme.settings);
    } catch {
      const preset = FESTIVAL_PRESETS[activeTheme.name];
      settings = preset?.settings;
    }

    return NextResponse.json({
      theme: {
        id: activeTheme.id,
        name: activeTheme.name,
        label: activeTheme.label,
        description: activeTheme.description,
        settings,
        startDate: activeTheme.startDate,
        endDate: activeTheme.endDate,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ theme: null, error: e?.message });
  }
}
