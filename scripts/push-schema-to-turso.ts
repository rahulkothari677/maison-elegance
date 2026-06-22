import { createClient } from "@libsql/client";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Simple env loader to parse .env file natively
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const match = trimmed.match(/^([^=]+)=(.*)$/)
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        // Strip quotes if present
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    }
  }
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error("❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in env");
    process.exit(1);
  }

  console.log("🛠️ Generating SQL migration script from Prisma schema...");
  const sql = execSync(
    "npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
    { encoding: "utf-8" }
  );

  console.log("🔌 Connecting to Turso database...");
  const client = createClient({ url, authToken });

  console.log("🧹 Dropping existing tables if any...");
  // Drop tables in order of dependencies (due to foreign keys)
  const dropTables = [
    "PostComment", "StylePost", "Answer", "Question",
    "Review", "WishlistItem", "OrderItem", "Order", "Address", "Product",
    "Category", "Theme", "VerificationToken", "Session", "Account", "User"
  ];
  for (const table of dropTables) {
    try {
      await client.execute(`DROP TABLE IF EXISTS "${table}"`);
      console.log(`  Dropped table "${table}"`);
    } catch (err: any) {
      console.warn(`  Warning dropping "${table}":`, err.message);
    }
  }

  console.log("⚡ Executing database creation script...");
  // Strip lines starting with comments, then split by semicolon
  const cleanSql = sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  const statements = cleanSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`  Found ${statements.length} SQL statements to execute.`);

  for (const statement of statements) {
    try {
      await client.execute(statement);
    } catch (err: any) {
      console.error(`❌ Failed to execute: ${statement.substring(0, 100)}...`);
      console.error(`Reason: ${err.message}`);
      process.exit(1);
    }
  }

  console.log("✅ Successfully pushed schema to Turso database!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
