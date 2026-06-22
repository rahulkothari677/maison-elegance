import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ensureSiteContentTable } from "@/lib/ensure-tables";
import { DEFAULTS } from "@/app/api/site-content/route";

// GET /api/admin/site-content — returns all sections (admin only)
// Same as public but includes meta like updatedAt.
// Falls back to defaults if DB is unavailable (e.g. SiteContent table
// not yet migrated on Turso) so the admin UI still renders.
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Auto-create the table if it doesn't exist yet (self-healing)
    await ensureSiteContentTable();

    let rows: any[] = [];
    try {
      rows = await db.siteContent.findMany();
    } catch (dbErr: any) {
      console.warn("[admin/site-content] DB query failed, returning defaults:", dbErr?.message);
    }

    const all: Record<string, any> = {};

    // Start with defaults
    for (const section of Object.keys(DEFAULTS)) {
      all[section] = {
        data: DEFAULTS[section],
        updatedAt: null,
        isDefault: true,
      };
    }

    // Override with DB values (if any rows were returned)
    for (const row of rows) {
      try {
        all[row.section] = {
          data: JSON.parse(row.data),
          updatedAt: row.updatedAt,
          isDefault: false,
        };
      } catch {
        // keep default if JSON is broken
      }
    }

    return NextResponse.json({ sections: all });
  } catch (e: any) {
    // Last-resort fallback — never return 500, always return defaults
    // so the admin UI renders something usable.
    const all: Record<string, any> = {};
    for (const section of Object.keys(DEFAULTS)) {
      all[section] = {
        data: DEFAULTS[section],
        updatedAt: null,
        isDefault: true,
      };
    }
    return NextResponse.json({ sections: all, warning: e?.message });
  }
}

// PUT /api/admin/site-content — update one or more sections
// Body: { sections: { heroCarousel: {...}, lookbook: {...}, ... } }
export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const debugInfo: any = { step: "start" };

  try {
    const body = await req.json();
    debugInfo.step = "parsed-body";
    const sections = body.sections;
    if (!sections || typeof sections !== "object") {
      return NextResponse.json(
        { error: "Body must include 'sections' object", debug: debugInfo },
        { status: 400 }
      );
    }

    // Auto-create the table if it doesn't exist yet (self-healing)
    debugInfo.step = "ensuring-table";
    const tableResult = await ensureSiteContentTable();
    debugInfo.tableCreated = tableResult.created;
    debugInfo.tableError = tableResult.error;

    if (tableResult.error) {
      // Table creation failed — return detailed error so we can debug
      return NextResponse.json(
        {
          error: "Could not create or access the SiteContent table. " + tableResult.error,
          debug: debugInfo,
        },
        { status: 500 }
      );
    }

    debugInfo.step = "upserting";
    debugInfo.sections = Object.keys(sections);
    const updated: string[] = [];
    const errors: string[] = [];

    for (const [section, data] of Object.entries(sections)) {
      if (!DEFAULTS[section]) {
        // Skip unknown sections to prevent abuse
        continue;
      }
      try {
        await db.siteContent.upsert({
          where: { section },
          create: {
            section,
            data: JSON.stringify(data),
          },
          update: {
            data: JSON.stringify(data),
          },
        });
        updated.push(section);
      } catch (upsertErr: any) {
        // Try one more time after re-ensuring the table
        try {
          await ensureSiteContentTable();
          await db.siteContent.upsert({
            where: { section },
            create: { section, data: JSON.stringify(data) },
            update: { data: JSON.stringify(data) },
          });
          updated.push(section);
        } catch (retryErr: any) {
          errors.push(`${section}: ${retryErr?.message || upsertErr?.message || "unknown"}`);
        }
      }
    }

    if (errors.length > 0 && updated.length === 0) {
      // All saves failed
      return NextResponse.json(
        {
          error: "Failed to save. Errors: " + errors.join("; "),
          debug: { ...debugInfo, errors },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      updated,
      errors: errors.length > 0 ? errors : undefined,
      message: `Saved ${updated.length} section${updated.length === 1 ? "" : "s"}`,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: e.message || "Failed to save content",
        debug: { ...debugInfo, stack: e?.stack?.split("\n").slice(0, 5) },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/site-content?section=heroCarousel — reset to default
export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section");
  if (!section) {
    return NextResponse.json({ error: "Section required" }, { status: 400 });
  }

  try {
    await ensureSiteContentTable();
    await db.siteContent.deleteMany({ where: { section } });
    return NextResponse.json({
      ok: true,
      message: `Reset ${section} to defaults`,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Failed to reset" },
      { status: 500 }
    );
  }
}
