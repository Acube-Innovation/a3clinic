import "server-only";
import mysql from "mysql2/promise";

/**
 * MySQL/MariaDB backend for the content store. Each collection is stored as a
 * whole JSON document in the `documents` table — the exact shape the file
 * store used, so `readDoc`/`writeDoc` call sites are unchanged.
 *
 * Configuration comes from MYSQL_* env vars (see .env.example). When they are
 * absent, store.ts falls back to the /content file store so `next build` and
 * local checkouts work without a database.
 */

type Bundle = { pool: mysql.Pool; ready: Promise<unknown> };

// Survive Next.js dev-server hot reloads without leaking connection pools.
const globalRef = globalThis as unknown as { __a3clinicMysql?: Bundle };

export function mysqlConfigured(): boolean {
  return Boolean(process.env.MYSQL_DATABASE && process.env.MYSQL_USER);
}

function bundle(): Bundle {
  if (!globalRef.__a3clinicMysql) {
    const pool = mysql.createPool({
      host: process.env.MYSQL_HOST ?? "127.0.0.1",
      port: Number(process.env.MYSQL_PORT ?? 3306),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      connectionLimit: 10,
      charset: "utf8mb4",
    });
    const ready = pool.query(
      `CREATE TABLE IF NOT EXISTS documents (
         name VARCHAR(64) NOT NULL PRIMARY KEY,
         data LONGTEXT NOT NULL,
         updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
           ON UPDATE CURRENT_TIMESTAMP
       ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    globalRef.__a3clinicMysql = { pool, ready };
  }
  return globalRef.__a3clinicMysql;
}

/** Returns the parsed document, or undefined when the row does not exist. */
export async function dbReadDoc(name: string): Promise<unknown | undefined> {
  const { pool, ready } = bundle();
  await ready;
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT data FROM documents WHERE name = ?",
    [name],
  );
  if (rows.length === 0) return undefined;
  return JSON.parse(rows[0].data as string);
}

export async function dbWriteDoc(name: string, data: unknown): Promise<void> {
  const { pool, ready } = bundle();
  await ready;
  const json = JSON.stringify(data);
  await pool.query(
    "INSERT INTO documents (name, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = ?",
    [name, json, json],
  );
}
