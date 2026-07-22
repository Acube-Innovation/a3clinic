import mysql from "mysql2/promise";

import { DDL } from "./schema.ts";

/**
 * Shared MySQL/MariaDB connection pool for the normalized content store.
 *
 * NOTE: this module and everything under src/lib/admin/db/* must NOT import
 * "server-only" — the standalone migration script (scripts/migrate-normalized.ts)
 * imports these files directly under Node, where "server-only" throws. The
 * server/client boundary is enforced one level up in src/lib/admin/store.ts,
 * which is the sole app entry point into this layer.
 */

export type Executor = mysql.Pool | mysql.PoolConnection;

type Bundle = { pool: mysql.Pool; ready: Promise<unknown> };

// Survive Next.js dev-server hot reloads without leaking connection pools.
const globalRef = globalThis as unknown as { __a3clinicPool?: Bundle };

export function mysqlConfigured(): boolean {
  return Boolean(process.env.MYSQL_DATABASE && process.env.MYSQL_USER);
}

function bundle(): Bundle {
  if (!globalRef.__a3clinicPool) {
    const pool = mysql.createPool({
      host: process.env.MYSQL_HOST ?? "127.0.0.1",
      port: Number(process.env.MYSQL_PORT ?? 3306),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      connectionLimit: 10,
      charset: "utf8mb4",
      // The schema is created as a series of statements on first use.
      multipleStatements: false,
    });
    // Run the DDL once; every read/write awaits this first.
    const ready = (async () => {
      for (const stmt of DDL) await pool.query(stmt);
    })();
    globalRef.__a3clinicPool = { pool, ready };
  }
  return globalRef.__a3clinicPool;
}

export async function getPool(): Promise<mysql.Pool> {
  const { pool, ready } = bundle();
  await ready;
  return pool;
}

/** Run `fn` inside a single transaction, committing on success. */
export async function withTransaction<T>(
  fn: (conn: mysql.PoolConnection) => Promise<T>,
): Promise<T> {
  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
