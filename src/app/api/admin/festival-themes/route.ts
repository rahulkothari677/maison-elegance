import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ensureFestivalThemeTable } from "@/lib/ensure-tables";
import { FESTIVAL_PRESETS } from "@/lib/festival-themes";

/**
 * GET /api/admin/festival-themes
 * Returns all festival themes (presets + any custom ones in DB) with their
 * active status, start/end dates, etc.
 */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const dbThemes = await db.festivalTheme.findMany();
    const dbByName: Record<string, any> = {};
    for (const t of dbThemes) {
      dbByName[t.name] = t;
    }

    // Combine presets with DB state
    const allThemes = Object.entries(FESTIVAL_PRESETS).map(([name, preset]) => {
      const dbTheme = dbByName[name];
      return {
        name,
        label: preset.label,
        description: preset.description,
        settings: preset.settings,
        isActive: dbTheme?.isActive || false,
        startDate: dbTheme?.startDate || null,
        endDate: dbTheme?.endDate || null,
        inDb: !!dbTheme,
      };
    });

    return NextResponse.json({ themes: allThemes });
  } catch (e: any) {
    // DB table might not exist yet — return just presets
    const allThemes = Object.entries(FESTIVAL_PRESETS).map(([name, preset]) => ({
      name,
      label: preset.label,
      description: preset.description,
      settings: preset.settings,
      isActive: false,
      startDate: null,
      endDate: null,
      inDb: false,
    }));
    return NextResponse.json({ themes: allThemes, warning: e?.message });
  }
}

/**
 * PUT /api/admin/festival-themes
 * Body: { name: string, action: "activate" | "deactivate" | "schedule", startDate?, endDate? }
 *
 * - activate: sets this theme active, deactivates all others
 * - deactivate: sets this theme inactive
 * - schedule: sets startDate + endDate (auto-activates/deactivates)
 */
export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, action, startDate, endDate } = body;

    if (!name || !FESTIVAL_PRESETS[name]) {
      return NextResponse.json(
        { error: `Unknown festival theme: ${name}` },
        { status: 400 }
      );
    }

    const preset = FESTIVAL_PRESETS[name];
    const settingsJson = JSON.stringify(preset.settings);

    // Ensure the table exists
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "FestivalTheme" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "label" TEXT NOT NULL,
          "description" TEXT,
          "settings" TEXT NOT NULL,
          "startDate" DATETIME,
          "endDate" DATETIME,
          "isActive" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
        )
      `);
      await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "FestivalTheme_name_key" ON "FestivalTheme"("name")`);
    } catch (e) {
      // Table might already exist — continue
    }

    if (action === "activate") {
      // Deactivate all other themes
      await db.festivalTheme.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
      // Activate this one (upsert)
      await db.festivalTheme.upsert({
        where: { name },
        create: {
          name,
          label: preset.label,
          description: preset.description,
          settings: settingsJson,
          isActive: true,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
        },
        update: {
          isActive: true,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
        },
      });
      return NextResponse.json({ ok: true, message: `${preset.label} activated` });
    }

    if (action === "deactivate") {
      await db.festivalTheme.updateMany({
        where: { name },
        data: { isActive: false },
      });
      return NextResponse.json({ ok: true, message: `${preset.label} deactivated` });
    }

    if (action === "schedule") {
      if (!startDate || !endDate) {
        return NextResponse.json(
          { error: "startDate and endDate required for scheduling" },
          { status: 400 }
        );
      }
      await db.festivalTheme.upsert({
        where: { name },
        create: {
          name,
          label: preset.label,
          description: preset.description,
          settings: settingsJson,
          isActive: false,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
        update: {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      });
      return NextResponse.json({
        ok: true,
        message: `${preset.label} scheduled — will auto-activate ${new Date(startDate).toLocaleString()} and deactivate ${new Date(endDate).toLocaleString()}`,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Failed to update festival theme" },
      { status: 500 }
    );
  }
}
