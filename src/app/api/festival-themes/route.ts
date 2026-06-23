import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureFestivalThemeTable } from "@/lib/ensure-tables";
import { FESTIVAL_PRESETS } from "@/lib/festival-themes";

/**
 * GET /api/festival-themes
 * Public endpoint — returns the currently active festival theme (if any).
 * Also handles auto-activation/deactivation based on startDate/endDate.
 *
 * Defensive: if the Prisma client doesn't have the FestivalTheme model
 * (e.g. postinstall prisma generate hasn't run yet on Vercel), returns
 * { theme: null } instead of crashing.
 */
export async function GET() {
  try {
    // Safety check: if db.festivalTheme doesn't exist, return null
    // (Prisma client wasn't regenerated with the new schema yet)
    if (!db || !(db as any).festivalTheme) {
      return NextResponse.json({ theme: null });
    }

    await ensureFestivalThemeTable();

    // Check for auto-activation/deactivation
    const now = new Date();
    let themes: any[] = [];
    try {
      themes = await db.festivalTheme.findMany();
    } catch (findErr: any) {
      // Table might not exist yet — return null
      return NextResponse.json({ theme: null, warning: findErr?.message });
    }

    for (const theme of themes) {
      try {
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
        if (theme.isActive && theme.endDate && theme.endDate <= now) {
          await db.festivalTheme.update({
            where: { id: theme.id },
            data: { isActive: false },
          });
          theme.isActive = false;
        }
      } catch (updateErr) {
        // Continue even if auto-activation fails
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
