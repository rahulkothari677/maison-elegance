// Seed default theme presets
// Run with: bun run /home/z/my-project/scripts/seed-themes.ts

import { db } from "../src/lib/db";
import { PRESET_THEMES } from "../src/lib/use-theme-settings";

async function main() {
  console.log("🎨 Seeding theme presets...");
  await db.theme.deleteMany();

  for (const preset of PRESET_THEMES) {
    await db.theme.create({
      data: {
        name: preset.name,
        settings: JSON.stringify(preset.settings),
        isActive: preset.name === "Ivory Classic",
      },
    });
    console.log(`  ✓ ${preset.name}`);
  }

  console.log(`\n✅ ${PRESET_THEMES.length} themes seeded. Active: "Ivory Classic"`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
