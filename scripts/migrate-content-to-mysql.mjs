/**
 * One-shot migration: copies every /content/<name>.json document into the
 * MySQL `documents` table (creating it if needed). Safe to re-run — each run
 * upserts, overwriting the DB copy with the file copy.
 *
 * Usage:  node --env-file=.env.local scripts/migrate-content-to-mysql.mjs
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const CONTENT_DIR = path.join(process.cwd(), "content");

const { MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } =
  process.env;

if (!MYSQL_DATABASE || !MYSQL_USER) {
  console.error(
    "MYSQL_USER and MYSQL_DATABASE must be set (run with --env-file=.env.local).",
  );
  process.exit(1);
}

const pool = mysql.createPool({
  host: MYSQL_HOST ?? "127.0.0.1",
  port: Number(MYSQL_PORT ?? 3306),
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  charset: "utf8mb4",
});

await pool.query(
  `CREATE TABLE IF NOT EXISTS documents (
     name VARCHAR(64) NOT NULL PRIMARY KEY,
     data LONGTEXT NOT NULL,
     updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
       ON UPDATE CURRENT_TIMESTAMP
   ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
);

const entries = (await readdir(CONTENT_DIR, { withFileTypes: true }))
  .filter((e) => e.isFile() && e.name.endsWith(".json"))
  .map((e) => e.name)
  .sort();

for (const file of entries) {
  const name = file.replace(/\.json$/, "");
  const raw = await readFile(path.join(CONTENT_DIR, file), "utf8");
  const json = JSON.stringify(JSON.parse(raw)); // validate before writing
  await pool.query(
    "INSERT INTO documents (name, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = ?",
    [name, json, json],
  );
  console.log(`✓ ${name}  (${(json.length / 1024).toFixed(1)} kB)`);
}

const [rows] = await pool.query(
  "SELECT name, CHAR_LENGTH(data) AS bytes, updated_at FROM documents ORDER BY name",
);
console.log(`\n${rows.length} documents now in '${MYSQL_DATABASE}.documents'.`);
await pool.end();
