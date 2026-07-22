import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * File-backed content store: one JSON document per collection under /content.
 *
 * This is the same backend seam described in README — the public data layer
 * reads through these documents with its in-code defaults as fallback, so the
 * site works identically before and after the first admin edit. Swapping this
 * module for a database keeps every call site unchanged.
 */

const CONTENT_DIR = path.join(process.cwd(), "content");

function fileFor(name: string): string {
  // Collection names are internal constants, but never trust path segments.
  if (!/^[a-z-]+$/.test(name)) throw new Error(`Bad collection name: ${name}`);
  return path.join(CONTENT_DIR, `${name}.json`);
}

export async function readDoc<T>(name: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(fileFor(name), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    // Missing or unreadable file — the in-code defaults apply. Cloned, so a
    // caller that mutates the result can never poison the shared defaults.
    return structuredClone(fallback);
  }
}

export async function writeDoc<T>(name: string, data: T): Promise<void> {
  await mkdir(CONTENT_DIR, { recursive: true });
  await writeFile(fileFor(name), JSON.stringify(data, null, 2), "utf8");
}
