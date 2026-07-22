import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { dbReadDoc, dbWriteDoc, mysqlConfigured } from "./mysql";

/**
 * Content store: one JSON document per collection.
 *
 * Backend is MySQL/MariaDB (documents table) when MYSQL_* env vars are set —
 * the production configuration — and falls back to files under /content
 * otherwise, so builds and checkouts without a database still work. The
 * public data layer reads through these documents with its in-code defaults
 * as a final fallback, so the site renders identically before the first save.
 */

const CONTENT_DIR = path.join(process.cwd(), "content");

let warnedFileFallback = false;

function assertName(name: string): void {
  // Collection names are internal constants, but never trust path segments.
  if (!/^[a-z-]+$/.test(name)) throw new Error(`Bad collection name: ${name}`);
}

function fileFor(name: string): string {
  return path.join(CONTENT_DIR, `${name}.json`);
}

function usingMysql(): boolean {
  if (mysqlConfigured()) return true;
  if (!warnedFileFallback && process.env.NODE_ENV === "production") {
    warnedFileFallback = true;
    console.warn(
      "[content-store] MYSQL_* env vars not set — using the /content file store.",
    );
  }
  return false;
}

export async function readDoc<T>(name: string, fallback: T): Promise<T> {
  assertName(name);
  if (usingMysql()) {
    const doc = await dbReadDoc(name);
    // Missing row — the in-code defaults apply. Cloned, so a caller that
    // mutates the result can never poison the shared defaults.
    if (doc === undefined) return structuredClone(fallback);
    return doc as T;
  }
  try {
    const raw = await readFile(fileFor(name), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return structuredClone(fallback);
  }
}

export async function writeDoc<T>(name: string, data: T): Promise<void> {
  assertName(name);
  if (usingMysql()) {
    await dbWriteDoc(name, data);
    return;
  }
  await mkdir(CONTENT_DIR, { recursive: true });
  await writeFile(fileFor(name), JSON.stringify(data, null, 2), "utf8");
}
