import { getPool, mysqlConfigured, withTransaction } from "./pool.ts";
import { repositories } from "./repositories.ts";

/**
 * Dispatch layer that preserves the document-shaped store API on top of the
 * normalized tables. `store.ts` calls these three exports and nothing else.
 *
 * A section is "initialized" once written at least once (tracked in the
 * `sections` table). Until then `dbReadDoc` returns undefined so the caller
 * falls back to its in-code defaults — the same row-existence semantics the
 * previous single-blob `documents` table had.
 */

export { mysqlConfigured };

async function isInitialized(name: string): Promise<boolean> {
  const pool = await getPool();
  const [rows] = await pool.query("SELECT 1 FROM `sections` WHERE `name` = ?", [name]);
  return (rows as unknown[]).length > 0;
}

export async function dbReadDoc(name: string): Promise<unknown | undefined> {
  const repo = repositories[name];
  if (!repo) throw new Error(`No repository for section: ${name}`);
  const pool = await getPool();
  if (!(await isInitialized(name))) return undefined;
  return repo.read(pool);
}

export async function dbWriteDoc(name: string, data: unknown): Promise<void> {
  const repo = repositories[name];
  if (!repo) throw new Error(`No repository for section: ${name}`);
  await withTransaction(async (conn) => {
    await repo.write(conn, data as never);
    await conn.query(
      "INSERT INTO `sections` (`name`) VALUES (?) ON DUPLICATE KEY UPDATE `name` = `name`",
      [name],
    );
  });
}
