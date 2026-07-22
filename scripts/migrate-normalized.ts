/**
 * Migrate the single-blob `documents` table (or the content/*.json files) into
 * the fully-normalized per-section schema. Re-runnable and idempotent — each
 * section is decomposed and rewritten via the app's own repositories, so this
 * script and the running app can never drift.
 *
 * Usage:  node --env-file=.env.local scripts/migrate-normalized.ts
 */
import { promises as fs } from "node:fs";
import path from "node:path";

import { getPool } from "../src/lib/admin/db/pool.ts";
import { repositories } from "../src/lib/admin/db/repositories.ts";
import { dbWriteDoc } from "../src/lib/admin/db/index.ts";

const NAMES = Object.keys(repositories);

async function sourceDocuments(): Promise<Map<string, unknown>> {
  const out = new Map<string, unknown>();
  const pool = await getPool(); // also creates the normalized schema

  // Prefer the current live backend: the single-blob `documents` table.
  try {
    const [rows] = await pool.query("SELECT `name`, `data` FROM `documents`");
    for (const row of rows as { name: string; data: string }[]) {
      if (NAMES.includes(row.name)) out.set(row.name, JSON.parse(row.data));
    }
    if (out.size > 0) {
      console.log(`Source: ${out.size} documents from the 'documents' table.`);
      return out;
    }
  } catch {
    // No documents table — fall through to files.
  }

  // Fall back to the content/*.json seed files.
  for (const name of NAMES) {
    try {
      const raw = await fs.readFile(path.join("content", `${name}.json`), "utf8");
      out.set(name, JSON.parse(raw));
    } catch {
      /* section has no stored data — leave it to in-code defaults */
    }
  }
  console.log(`Source: ${out.size} content/*.json files.`);
  return out;
}

async function main(): Promise<void> {
  const docs = await sourceDocuments();

  for (const name of NAMES) {
    if (!docs.has(name)) {
      console.log(`- ${name}: no source data, skipped (falls back to defaults)`);
      continue;
    }
    await dbWriteDoc(name, docs.get(name));
    console.log(`✓ ${name}`);
  }

  // Row-count summary for verification.
  const pool = await getPool();
  const [tables] = await pool.query(
    "SELECT TABLE_NAME AS t FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME",
  );
  console.log("\nRow counts:");
  for (const { t } of tables as { t: string }[]) {
    if (t === "documents") continue;
    const [[{ n }]] = (await pool.query(
      `SELECT COUNT(*) AS n FROM \`${t}\``,
    )) as unknown as [[{ n: number }]];
    console.log(`  ${t.padEnd(28)} ${n}`);
  }

  await pool.end();
}

await main();
