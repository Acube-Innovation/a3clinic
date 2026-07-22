"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import { requireAdmin } from "./auth";

/**
 * Admin image upload. Files land in content/uploads (NOT /public — files
 * added to /public after build are not reliably served by `next start`) and
 * are streamed back via app/uploads/[...path]/route.ts.
 */

const UPLOAD_DIR = path.join(process.cwd(), "content", "uploads");
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const extensionFor: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadImage(
  formData: FormData,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "No file received." };
  }

  const extension = extensionFor[file.type];
  if (!extension) {
    return { ok: false, error: "Please upload a JPG, PNG or WebP image." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Images must be under 5 MB." };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  // Before/after photos get the clinic watermark BAKED INTO THE PIXELS at
  // upload time. A CSS overlay can be stripped in seconds; a composited
  // watermark survives every download, screenshot aside.
  if (formData.get("watermark") === "true") {
    const name = `${randomUUID()}.jpg`;
    const watermarked = await applyWatermark(Buffer.from(await file.arrayBuffer()));
    await writeFile(path.join(UPLOAD_DIR, name), watermarked);
    return { ok: true, url: `/uploads/${name}` };
  }

  const name = `${randomUUID()}.${extension}`;
  await writeFile(
    path.join(UPLOAD_DIR, name),
    Buffer.from(await file.arrayBuffer()),
  );

  return { ok: true, url: `/uploads/${name}` };
}

/** Tiled diagonal clinic watermark + a solid credit chip, composited by sharp. */
async function applyWatermark(input: Buffer): Promise<Buffer> {
  const base = sharp(input).rotate(); // respect EXIF orientation
  const meta = await base.metadata();

  // Cap size — result photos never need more than ~1600px on the web.
  const width = Math.min(meta.width ?? 1600, 1600);
  const resized = await base
    .resize({ width, withoutEnlargement: true })
    .toBuffer();
  const { width: w = width, height: h = 900 } = await sharp(resized).metadata();

  const text = "Dr. Riji's Health Care";
  const step = 180;
  const rows: string[] = [];
  // Cover the rotated plane generously so the tilt leaves no gaps.
  for (let y = -h; y < h * 2; y += step) {
    for (let x = -w; x < w * 2; x += 420) {
      rows.push(
        `<text x="${x}" y="${y}" font-size="28" font-family="Arial, sans-serif" font-weight="600" fill="#ffffff" fill-opacity="0.16" stroke="#044B4D" stroke-opacity="0.10" stroke-width="1">${text}</text>`,
      );
    }
  }

  const overlay = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <g transform="rotate(-30 ${w / 2} ${h / 2})">${rows.join("")}</g>
    <rect x="${w - 268}" y="${h - 46}" width="256" height="34" rx="17" fill="#022628" fill-opacity="0.72"/>
    <text x="${w - 140}" y="${h - 23}" text-anchor="middle" font-size="15" font-family="Arial, sans-serif" font-weight="600" fill="#ffffff" fill-opacity="0.95">© Dr. Riji's Health Care</text>
  </svg>`;

  return sharp(resized)
    .composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
    .jpeg({ quality: 82, progressive: true })
    .toBuffer();
}
