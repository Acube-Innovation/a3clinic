/**
 * Deterministic per-condition artwork.
 *
 * Every condition needs a hero background (dark, text sits on top) and an
 * intro illustration (light, carries the condition name). Real clinical
 * photography is not something we can invent, and stock photos of diseased
 * skin would be both unlicensed and distressing — so each condition gets
 * in-palette abstract artwork whose motif is chosen from the condition itself:
 * strands for hair and scalp, plaques for skin, a pulse for chronic disease,
 * a bloom for women's health, bubbles for paediatrics.
 *
 * Deterministic: the slug seeds the PRNG, so re-running never churns files and
 * the same condition always looks the same.
 *
 * Usage:  node scripts/generate-condition-art.ts [--force] [slug ...]
 *         (no slugs = every condition in content/conditions.json missing art)
 */
import { promises as fs } from "node:fs";
import path from "node:path";

import sharp from "sharp";

// Overridable so the artwork can be previewed without touching public/uploads.
const UPLOADS = process.env.ART_OUT_DIR ?? path.join(process.cwd(), "public", "uploads");
const SOURCE =
  process.env.ART_SOURCE ?? path.join(process.cwd(), "content", "conditions.json");
const HERO = { w: 1600, h: 700 };
const INTRO = { w: 1200, h: 900 };

type Motif = "strands" | "plaques" | "pulse" | "bloom" | "bubbles";

/** Motif per category, overridable per slug below. */
const byCategory: Record<string, Motif> = {
  hair: "strands",
  skin: "plaques",
  chronic: "pulse",
  womens: "bloom",
  child: "bubbles",
};

/**
 * Conditions whose motif is not the one their category implies — the
 * hair-and-scalp entries filed under Skin keep the strand motif so the
 * speciality reads as one family across the site.
 */
const bySlug: Record<string, Motif> = {
  "acne-keloidalis-nuchae": "strands",
  "dissecting-cellulitis-of-the-scalp": "strands",
  "pityriasis-amiantacea": "strands",
  "pediculosis-capitis": "strands",
  "pilar-cyst": "strands",
  "scalp-acne": "strands",
  "scalp-lichen-simplex-chronicus": "strands",
  "scalp-vitiligo": "strands",
  kerion: "strands",
  "hair-dye-allergy": "strands",
  "nevus-sebaceus": "strands",
  "pseudofolliculitis-barbae": "strands",
};

/* ------------------------------- palette ------------------------------- */

const ink = "#04302F";

/**
 * Two ink sets. On the light intro canvas the motif is the artwork and has to
 * hold its own against near-white; on the dark hero it sits behind headline
 * text and must stay a whisper.
 */
const inks = {
  light: {
    teals: ["#5E8A8C", "#41777A", "#7FA3A5"],
    olives: ["#9DB955", "#8AA347", "#B6C77E"],
    alpha: [0.34, 0.42] as const,
  },
  dark: {
    teals: ["#A8C6C7", "#8FB4B5", "#C2D8D8"],
    olives: ["#C7D79A", "#B4C782", "#DCE6BE"],
    alpha: [0.45, 0.45] as const,
  },
};

type Ctx = {
  r: () => number;
  w: number;
  h: number;
  /** Random stroke colour from the active ink set. */
  c: () => string;
  /** Random opacity within the active ink set's range. */
  o: () => number;
};

/* ------------------------------- helpers ------------------------------- */

/** FNV-1a — same hashing idea as PlaceholderImage, so art stays stable. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — small seeded PRNG, enough for decorative geometry. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(r: () => number, list: T[]): T {
  return list[Math.floor(r() * list.length) % list.length];
}

const n = (v: number) => Math.round(v * 100) / 100;

function escapeXml(s: string): string {
  return s.replace(
    /[<>&'"]/g,
    (c) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[
        c
      ]!,
  );
}

/* -------------------------------- motifs -------------------------------- */

/** Closed organic outline through the given points — plaques, not polygons. */
function smoothClosed(pts: [number, number][]): string {
  const mid = (a: [number, number], b: [number, number]) =>
    [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as [number, number];
  let d = `M ${n(mid(pts[pts.length - 1], pts[0])[0])} ${n(mid(pts[pts.length - 1], pts[0])[1])}`;
  for (let i = 0; i < pts.length; i++) {
    const cur = pts[i];
    const m = mid(cur, pts[(i + 1) % pts.length]);
    d += ` Q ${n(cur[0])} ${n(cur[1])}, ${n(m[0])} ${n(m[1])}`;
  }
  return `${d} Z`;
}

/** Hair and scalp — long swaying strands. */
function strands({ r, w, h, c, o }: Ctx): string {
  const out: string[] = [];
  const count = 36 + Math.floor(r() * 18);
  for (let i = 0; i < count; i++) {
    const x = r() * w * 1.1 - w * 0.05;
    const sway = (r() - 0.5) * w * 0.22;
    const d = `M ${n(x)} ${-20} C ${n(x + sway)} ${n(h * 0.3)}, ${n(x - sway)} ${n(h * 0.65)}, ${n(x + sway * 0.6)} ${n(h + 20)}`;
    out.push(
      `<path d="${d}" fill="none" stroke="${c()}" stroke-width="${n(1 + r() * 1.7)}" stroke-linecap="round" opacity="${n(o())}"/>`,
    );
  }
  return out.join("");
}

/** Skin — overlapping plaques with a fine scale of flecks. */
function plaques({ r, w, h, c, o }: Ctx): string {
  const out: string[] = [];
  const count = 9 + Math.floor(r() * 6);
  for (let i = 0; i < count; i++) {
    const cx = r() * w;
    const cy = r() * h;
    const rad = Math.min(w, h) * (0.06 + r() * 0.13);
    const pts: [number, number][] = [];
    const steps = 11;
    for (let s = 0; s < steps; s++) {
      const a = (s / steps) * Math.PI * 2;
      const rr = rad * (0.68 + r() * 0.62);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.84]);
    }
    const d = smoothClosed(pts);
    const stroke = c();
    out.push(
      `<path d="${d}" fill="${stroke}" opacity="${n(o() * 0.3)}"/>`,
      `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${n(1.4 + r() * 1.6)}" opacity="${n(o() * 1.5)}"/>`,
    );
    for (let f = 0; f < 16; f++) {
      const a = r() * Math.PI * 2;
      const rr = rad * r() * 0.85;
      out.push(
        `<circle cx="${n(cx + Math.cos(a) * rr)}" cy="${n(cy + Math.sin(a) * rr * 0.8)}" r="${n(0.9 + r() * 2)}" fill="${stroke}" opacity="${n(o() * 1.3)}"/>`,
      );
    }
  }
  return out.join("");
}

/** Chronic and lifestyle — a steady traced rhythm with occasional beats. */
function pulse({ r, w, h, c, o }: Ctx): string {
  const out: string[] = [];
  const lines = 4 + Math.floor(r() * 3);
  for (let i = 0; i < lines; i++) {
    const baseY = (h / (lines + 1)) * (i + 1) + (r() - 0.5) * h * 0.04;
    const amp = h * (0.025 + r() * 0.05);
    const period = 5 + Math.floor(r() * 4); // samples per wave
    const beatEvery = period * (2 + Math.floor(r() * 3));
    const step = w / (period * (5 + Math.floor(r() * 4)));
    const pts: string[] = [];
    let k = 0;
    for (let x = -step; x <= w + step; x += step, k++) {
      const onBeat = k % beatEvery === 0;
      const y = onBeat
        ? baseY - amp * 2.4
        : k % beatEvery === 1
          ? baseY + amp * 1.3
          : baseY - Math.sin((k / period) * Math.PI * 2) * amp;
      pts.push(`${n(x)},${n(y)}`);
    }
    out.push(
      `<polyline points="${pts.join(" ")}" fill="none" stroke="${c()}" stroke-width="${n(1.4 + r() * 1.5)}" stroke-linejoin="round" stroke-linecap="round" opacity="${n(o() * 1.35)}"/>`,
    );
  }
  return out.join("");
}

/** Women's health — concentric petal rings opening outward. */
function bloom({ r, w, h, c, o }: Ctx): string {
  const out: string[] = [];
  const cx = w * (0.34 + r() * 0.3);
  const cy = h * (0.42 + r() * 0.2);
  const rings = 8 + Math.floor(r() * 4);
  for (let i = 1; i <= rings; i++) {
    const rad = Math.min(w, h) * 0.075 * i;
    const petals = 5 + Math.floor(r() * 4);
    const rot = r() * 360;
    const d: string[] = [];
    for (let p = 0; p < petals; p++) {
      const a0 = (p / petals) * Math.PI * 2;
      const a1 = ((p + 0.6) / petals) * Math.PI * 2;
      d.push(
        `M ${n(cx + Math.cos(a0) * rad)} ${n(cy + Math.sin(a0) * rad * 0.9)} A ${n(rad)} ${n(rad * 0.9)} 0 0 1 ${n(cx + Math.cos(a1) * rad)} ${n(cy + Math.sin(a1) * rad * 0.9)}`,
      );
    }
    out.push(
      `<path transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})" d="${d.join(" ")}" fill="none" stroke="${c()}" stroke-width="${n(1.6 + r() * 2)}" stroke-linecap="round" opacity="${n(o() * 1.4)}"/>`,
    );
  }
  return out.join("");
}

/** Child care — light, buoyant bubbles. */
function bubbles({ r, w, h, c, o }: Ctx): string {
  const out: string[] = [];
  const count = 24 + Math.floor(r() * 14);
  for (let i = 0; i < count; i++) {
    const cx = r() * w;
    const cy = r() * h;
    const rad = Math.min(w, h) * (0.014 + r() * 0.08);
    const stroke = c();
    out.push(
      `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(rad)}" fill="${stroke}" opacity="${n(o() * 0.28)}"/>`,
      `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(rad)}" fill="none" stroke="${stroke}" stroke-width="${n(1.4 + r() * 1.6)}" opacity="${n(o() * 1.4)}"/>`,
    );
  }
  return out.join("");
}

const motifs: Record<Motif, (ctx: Ctx) => string> = {
  strands,
  plaques,
  pulse,
  bloom,
  bubbles,
};

/* -------------------------------- canvas -------------------------------- */

function svg(opts: {
  w: number;
  h: number;
  motif: Motif;
  seed: number;
  dark: boolean;
  label?: string;
}): string {
  const { w, h, dark } = opts;
  const r = rng(opts.seed);
  const angle = Math.floor(r() * 180);
  const gx = n(20 + r() * 45);
  const gy = n(15 + r() * 45);

  const bg = dark
    ? { a: "#04302F", b: "#0E6A6C", glow: "#7A9833", glowOpacity: 0.35 }
    : { a: "#FFFFFF", b: "#DCEBEB", glow: "#9DB955", glowOpacity: 0.3 };

  // Dark heroes carry headline text on top: keep the motif to a whisper.
  const motifOpacity = dark ? 0.3 : 1;
  const set = dark ? inks.dark : inks.light;
  const ctx: Ctx = {
    r,
    w,
    h,
    c: () => pick(r, r() > 0.5 ? set.teals : set.olives),
    o: () => set.alpha[0] + r() * (set.alpha[1] - set.alpha[0] + 0.28),
  };

  const label = opts.label
    ? (() => {
        const fs = Math.round(h * 0.036) + 6;
        const text = escapeXml(opts.label);
        const width = Math.round(opts.label.length * fs * 0.56 + fs * 1.5);
        const x = Math.round(w * 0.033);
        const y = Math.round(h * 0.033);
        const boxH = Math.round(fs * 1.85);
        return `<g><rect x="${x}" y="${y}" rx="${boxH / 2}" ry="${boxH / 2}" width="${width}" height="${boxH}" fill="${ink}" opacity="0.92"/><text x="${x + fs * 0.75}" y="${y + boxH * 0.68}" font-family="DejaVu Sans, Liberation Sans, sans-serif" font-size="${fs}" font-weight="bold" fill="#FFFFFF">${text}</text></g>`;
      })()
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${bg.a}"/>
      <stop offset="100%" stop-color="${bg.b}"/>
    </linearGradient>
    <radialGradient id="glow" cx="${gx}%" cy="${gy}%" r="62%">
      <stop offset="0%" stop-color="${bg.glow}" stop-opacity="${bg.glowOpacity}"/>
      <stop offset="100%" stop-color="${bg.glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <g opacity="${motifOpacity}">${motifs[opts.motif](ctx)}</g>
  ${label}
</svg>`;
}

/* --------------------------------- main --------------------------------- */

type Rec = { slug: string; name: string; category: string };

async function render(file: string, markup: string, quality: number) {
  await sharp(Buffer.from(markup))
    .jpeg({ quality, progressive: true, mozjpeg: true })
    .toFile(path.join(UPLOADS, file));
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const only = new Set(args.filter((a) => !a.startsWith("--")));

  const all: Rec[] = JSON.parse(await fs.readFile(SOURCE, "utf8"));
  await fs.mkdir(UPLOADS, { recursive: true });

  let made = 0;
  for (const c of all) {
    if (only.size > 0 && !only.has(c.slug)) continue;
    const motif = bySlug[c.slug] ?? byCategory[c.category] ?? "plaques";
    const seed = hash(c.slug);

    for (const [file, dims, dark, label] of [
      [`${c.slug}-hero.jpg`, HERO, true, undefined],
      [`${c.slug}-intro.jpg`, INTRO, false, c.name],
    ] as const) {
      const target = path.join(UPLOADS, file);
      if (!force) {
        try {
          await fs.access(target);
          continue; // already drawn — never churn existing art
        } catch {
          /* not there yet */
        }
      }
      await render(
        file,
        svg({ w: dims.w, h: dims.h, motif, seed: dark ? seed : seed ^ 0x9e3779b9, dark, label }),
        dark ? 82 : 86,
      );
      made++;
    }
  }
  console.log(`${made} image${made === 1 ? "" : "s"} written to public/uploads.`);
}

await main();
