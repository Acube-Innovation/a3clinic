import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Serves admin-uploaded images from content/uploads. Public by design —
 * these are site photographs, never patient documents.
 */

const UPLOAD_DIR = path.join(process.cwd(), "content", "uploads");

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;

  // Uploads are flat files with UUID names — a single sanitised segment.
  const name = path.basename(segments.join("/"));
  const type = contentTypes[path.extname(name).toLowerCase()];
  if (!type || !/^[a-z0-9-]+\.[a-z]+$/.test(name)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await readFile(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": type,
        // UUID filenames never change content — cache hard.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
