import mysql from "mysql2/promise";

import type { Executor } from "./pool.ts";

/**
 * One read/write pair per content section. `read(x)` assembles rows from the
 * normalized tables back into the exact JSON document shape the app expects
 * (matching the types in src/data/*). `write(conn, data)` decomposes a whole
 * document into rows inside a caller-provided transaction.
 *
 * All shapes here mirror src/data/*.ts and src/lib/admin/inbox-types.ts. The
 * document-shaped contract is what keeps every call site upstream unchanged.
 */

type Row = Record<string, unknown>;
type Conn = mysql.PoolConnection;

const bt = (id: string) => "`" + id + "`";
const bool = (v: unknown) => (v ? 1 : 0);

async function select(
  x: Executor,
  sql: string,
  params: unknown[] = [],
): Promise<Row[]> {
  const [rows] = await (x as mysql.Pool).query(sql, params);
  return rows as Row[];
}

/** All rows of a table ordered by position (used for singleton child lists). */
function selectAll(x: Executor, table: string): Promise<Row[]> {
  return select(x, `SELECT * FROM ${bt(table)} ORDER BY ${bt("position")}`);
}

/** Rows of a keyed child table ordered by position. */
function selectKeyed(
  x: Executor,
  table: string,
  key: string,
  val: string,
): Promise<Row[]> {
  return select(
    x,
    `SELECT * FROM ${bt(table)} WHERE ${bt(key)}=? ORDER BY ${bt("position")}`,
    [val],
  );
}

async function insert(
  conn: Conn,
  table: string,
  data: Row,
): Promise<number> {
  const cols = Object.keys(data);
  const sql = `INSERT INTO ${bt(table)} (${cols.map(bt).join(",")}) VALUES (${cols
    .map(() => "?")
    .join(",")})`;
  const [res] = await conn.query(
    sql,
    cols.map((c) => data[c]),
  );
  return (res as mysql.ResultSetHeader).insertId;
}

async function upsert(
  conn: Conn,
  table: string,
  key: string,
  data: Row,
): Promise<void> {
  const cols = Object.keys(data);
  const updates = cols
    .filter((c) => c !== key)
    .map((c) => `${bt(c)}=VALUES(${bt(c)})`)
    .join(",");
  const sql = `INSERT INTO ${bt(table)} (${cols.map(bt).join(",")}) VALUES (${cols
    .map(() => "?")
    .join(",")}) ON DUPLICATE KEY UPDATE ${updates}`;
  await conn.query(
    sql,
    cols.map((c) => data[c]),
  );
}

/** Delete parent rows whose key is not in `keep` (children cascade). */
async function deleteMissing(
  conn: Conn,
  table: string,
  key: string,
  keep: string[],
): Promise<void> {
  if (keep.length === 0) {
    await conn.query(`DELETE FROM ${bt(table)}`);
    return;
  }
  await conn.query(
    `DELETE FROM ${bt(table)} WHERE ${bt(key)} NOT IN (${keep.map(() => "?").join(",")})`,
    keep,
  );
}

/** Replace all rows of a keyed child list, assigning position by array order. */
async function replaceKeyed(
  conn: Conn,
  table: string,
  key: string,
  val: string,
  items: Row[],
): Promise<void> {
  await conn.query(`DELETE FROM ${bt(table)} WHERE ${bt(key)}=?`, [val]);
  for (let i = 0; i < items.length; i++) {
    await insert(conn, table, { [key]: val, position: i, ...items[i] });
  }
}

/** Replace every row of a singleton child list. */
async function replaceAll(
  conn: Conn,
  table: string,
  items: Row[],
): Promise<void> {
  await conn.query(`DELETE FROM ${bt(table)}`);
  for (let i = 0; i < items.length; i++) {
    await insert(conn, table, { position: i, ...items[i] });
  }
}

const str = (v: unknown) => (v == null ? "" : String(v));
const arr = <T>(v: T[] | undefined | null): T[] => (Array.isArray(v) ? v : []);

/* ============================== conditions ============================== */

async function readConditions(x: Executor): Promise<Row[]> {
  const parents = await select(
    x,
    `SELECT * FROM ${bt("conditions")} ORDER BY ${bt("position")}`,
  );
  const out: Row[] = [];
  for (const p of parents) {
    const slug = String(p.slug);
    const rec: Row = {
      slug,
      name: str(p.name),
      category: p.category,
      featured: Boolean(p.featured),
      summary: str(p.summary),
      intro: str(p.intro),
      symptoms: (await selectKeyed(x, "condition_symptoms", "condition_slug", slug)).map(
        (r) => str(r.text),
      ),
      causes: (await selectKeyed(x, "condition_causes", "condition_slug", slug)).map(
        (r) => str(r.text),
      ),
      treatment: (await selectKeyed(x, "condition_treatment", "condition_slug", slug)).map(
        (r) => str(r.text),
      ),
      expectedResults: (
        await selectKeyed(x, "condition_expected_results", "condition_slug", slug)
      ).map((r) => ({ phase: str(r.phase), detail: str(r.detail) })),
      faqs: (await selectKeyed(x, "condition_faqs", "condition_slug", slug)).map((r) => ({
        question: str(r.question),
        answer: str(r.answer),
      })),
      results: (await selectKeyed(x, "condition_results", "condition_slug", slug)).map(
        (r) => ({
          before: str(r.before_image),
          after: str(r.after_image),
          label: str(r.label),
          note: str(r.note),
        }),
      ),
    };
    if (p.hero_image) rec.heroImage = String(p.hero_image);
    if (p.intro_image) rec.introImage = String(p.intro_image);
    out.push(rec);
  }
  return out;
}

async function writeConditions(conn: Conn, data: Row[]): Promise<void> {
  await deleteMissing(conn, "conditions", "slug", data.map((c) => String(c.slug)));
  for (let i = 0; i < data.length; i++) {
    const c = data[i];
    const slug = String(c.slug);
    await upsert(conn, "conditions", "slug", {
      slug,
      name: str(c.name),
      category: c.category,
      featured: bool(c.featured),
      summary: str(c.summary),
      intro: str(c.intro),
      hero_image: c.heroImage ?? null,
      intro_image: c.introImage ?? null,
      position: i,
    });
    await replaceKeyed(conn, "condition_symptoms", "condition_slug", slug,
      arr(c.symptoms as string[]).map((t) => ({ text: t })));
    await replaceKeyed(conn, "condition_causes", "condition_slug", slug,
      arr(c.causes as string[]).map((t) => ({ text: t })));
    await replaceKeyed(conn, "condition_treatment", "condition_slug", slug,
      arr(c.treatment as string[]).map((t) => ({ text: t })));
    await replaceKeyed(conn, "condition_expected_results", "condition_slug", slug,
      arr(c.expectedResults as Row[]).map((e) => ({ phase: str(e.phase), detail: str(e.detail) })));
    await replaceKeyed(conn, "condition_faqs", "condition_slug", slug,
      arr(c.faqs as Row[]).map((f) => ({ question: str(f.question), answer: str(f.answer) })));
    await replaceKeyed(conn, "condition_results", "condition_slug", slug,
      arr(c.results as Row[]).map((r) => ({
        before_image: str(r.before),
        after_image: str(r.after),
        label: str(r.label),
        note: str(r.note),
      })));
  }
}

/* =============================== products =============================== */

async function readProducts(x: Executor): Promise<Row[]> {
  const parents = await select(
    x,
    `SELECT * FROM ${bt("products")} ORDER BY ${bt("position")}`,
  );
  const out: Row[] = [];
  for (const p of parents) {
    const slug = String(p.slug);
    const rec: Row = {
      slug,
      name: str(p.name),
      category: p.category,
      tagline: str(p.tagline),
      description: str(p.description),
      price: Number(p.price),
      size: str(p.size),
      inStock: Boolean(p.in_stock),
      benefits: (await selectKeyed(x, "product_benefits", "product_slug", slug)).map(
        (r) => str(r.text),
      ),
      ingredients: (await selectKeyed(x, "product_ingredients", "product_slug", slug)).map(
        (r) => ({ name: str(r.name), role: str(r.role) }),
      ),
      directions: (await selectKeyed(x, "product_directions", "product_slug", slug)).map(
        (r) => str(r.text),
      ),
      caution: str(p.caution),
      rating: { value: Number(p.rating_value), count: Number(p.rating_count) },
      reviews: (await selectKeyed(x, "product_reviews", "product_slug", slug)).map((r) => ({
        author: str(r.author),
        location: str(r.location),
        rating: Number(r.rating),
        date: str(r.date),
        title: str(r.title),
        body: str(r.body),
      })),
      related: (await selectKeyed(x, "product_related", "product_slug", slug)).map((r) =>
        str(r.related_slug),
      ),
    };
    if (p.image) rec.image = String(p.image);
    if (p.compare_at_price != null) rec.compareAtPrice = Number(p.compare_at_price);
    if (p.featured) rec.featured = true;
    if (p.bestseller) rec.bestseller = true;
    out.push(rec);
  }
  return out;
}

async function writeProducts(conn: Conn, data: Row[]): Promise<void> {
  await deleteMissing(conn, "products", "slug", data.map((p) => String(p.slug)));
  for (let i = 0; i < data.length; i++) {
    const p = data[i];
    const slug = String(p.slug);
    const rating = (p.rating as Row) ?? {};
    await upsert(conn, "products", "slug", {
      slug,
      name: str(p.name),
      category: p.category,
      image: p.image ?? null,
      tagline: str(p.tagline),
      description: str(p.description),
      price: Number(p.price) || 0,
      compare_at_price: p.compareAtPrice ?? null,
      size: str(p.size),
      in_stock: bool(p.inStock),
      featured: bool(p.featured),
      bestseller: bool(p.bestseller),
      caution: str(p.caution),
      rating_value: Number(rating.value) || 0,
      rating_count: Number(rating.count) || 0,
      position: i,
    });
    await replaceKeyed(conn, "product_benefits", "product_slug", slug,
      arr(p.benefits as string[]).map((t) => ({ text: t })));
    await replaceKeyed(conn, "product_directions", "product_slug", slug,
      arr(p.directions as string[]).map((t) => ({ text: t })));
    await replaceKeyed(conn, "product_related", "product_slug", slug,
      arr(p.related as string[]).map((s) => ({ related_slug: s })));
    await replaceKeyed(conn, "product_ingredients", "product_slug", slug,
      arr(p.ingredients as Row[]).map((g) => ({ name: str(g.name), role: str(g.role) })));
    await replaceKeyed(conn, "product_reviews", "product_slug", slug,
      arr(p.reviews as Row[]).map((r) => ({
        author: str(r.author),
        location: str(r.location),
        rating: Number(r.rating) || 0,
        date: str(r.date),
        title: str(r.title),
        body: str(r.body),
      })));
  }
}

/* ================================ posts ================================ */

async function readPosts(x: Executor): Promise<Row[]> {
  const parents = await select(
    x,
    `SELECT * FROM ${bt("posts")} ORDER BY ${bt("position")}`,
  );
  const out: Row[] = [];
  for (const p of parents) {
    const slug = String(p.slug);
    const blocks = await selectKeyed(x, "post_blocks", "post_slug", slug);
    const body: Row[] = [];
    for (const b of blocks) {
      if (b.type === "list") {
        const items = await select(
          x,
          `SELECT ${bt("text")} FROM ${bt("post_block_items")} WHERE ${bt("block_id")}=? ORDER BY ${bt("position")}`,
          [b.id],
        );
        body.push({ type: "list", items: items.map((r) => str(r.text)) });
      } else {
        body.push({ type: b.type, text: str(b.text) });
      }
    }
    const rec: Row = {
      slug,
      title: str(p.title),
      category: p.category,
      excerpt: str(p.excerpt),
      publishedAt: str(p.published_at),
      readingMinutes: Number(p.reading_minutes),
      body,
    };
    if (p.image) rec.image = String(p.image);
    if (p.featured) rec.featured = true;
    out.push(rec);
  }
  return out;
}

async function writePosts(conn: Conn, data: Row[]): Promise<void> {
  await deleteMissing(conn, "posts", "slug", data.map((p) => String(p.slug)));
  for (let i = 0; i < data.length; i++) {
    const p = data[i];
    const slug = String(p.slug);
    await upsert(conn, "posts", "slug", {
      slug,
      title: str(p.title),
      category: p.category,
      image: p.image ?? null,
      excerpt: str(p.excerpt),
      published_at: str(p.publishedAt),
      reading_minutes: Number(p.readingMinutes) || 0,
      featured: bool(p.featured),
      position: i,
    });
    // Rebuild blocks (post_block_items cascade-delete with their block).
    await conn.query(`DELETE FROM ${bt("post_blocks")} WHERE ${bt("post_slug")}=?`, [slug]);
    const blocks = arr(p.body as Row[]);
    for (let j = 0; j < blocks.length; j++) {
      const b = blocks[j];
      const isList = b.type === "list";
      const blockId = await insert(conn, "post_blocks", {
        post_slug: slug,
        position: j,
        type: String(b.type),
        text: isList ? null : str(b.text),
      });
      if (isList) {
        const items = arr(b.items as string[]);
        for (let k = 0; k < items.length; k++) {
          await insert(conn, "post_block_items", {
            block_id: blockId,
            position: k,
            text: items[k],
          });
        }
      }
    }
  }
}

/* ============================= testimonials ============================= */

async function readTestimonials(x: Executor): Promise<Row[]> {
  const rows = await select(
    x,
    `SELECT * FROM ${bt("testimonials")} ORDER BY ${bt("position")}`,
  );
  return rows.map((r) => {
    const rec: Row = {
      author: str(r.author),
      location: str(r.location),
      quote: str(r.quote),
      context: str(r.context),
      consentOnFile: Boolean(r.consent_on_file),
    };
    // Preserve whichever identity the record originally carried.
    if (r.rec_id != null) rec.id = String(r.rec_id);
    if (r.slug != null) rec.slug = String(r.slug);
    return rec;
  });
}

async function writeTestimonials(conn: Conn, data: Row[]): Promise<void> {
  await conn.query(`DELETE FROM ${bt("testimonials")}`);
  for (let i = 0; i < data.length; i++) {
    const t = data[i];
    await insert(conn, "testimonials", {
      rec_id: t.id ?? null,
      slug: t.slug ?? null,
      author: str(t.author),
      location: str(t.location),
      quote: str(t.quote),
      context: str(t.context),
      consent_on_file: bool(t.consentOnFile),
      position: i,
    });
  }
}

/* =============================== faqs =============================== */

async function readFaqs(x: Executor): Promise<Row[]> {
  return (await selectAll(x, "homepage_faqs")).map((r) => ({
    question: str(r.question),
    answer: str(r.answer),
  }));
}

async function writeFaqs(conn: Conn, data: Row[]): Promise<void> {
  await replaceAll(conn, "homepage_faqs",
    arr(data).map((f) => ({ question: str(f.question), answer: str(f.answer) })));
}

/* =============================== doctor =============================== */

async function readDoctor(x: Executor): Promise<Row> {
  const d = (await select(x, `SELECT * FROM ${bt("doctor")} WHERE ${bt("id")}=1`))[0] ?? {};
  return {
    biography: {
      intro: str(d.bio_intro),
      paragraphs: (await selectAll(x, "doctor_bio_paragraphs")).map((r) => str(r.text)),
    },
    education: (await selectAll(x, "doctor_education")).map((r) => ({
      year: str(r.year),
      qualification: str(r.qualification),
      institution: str(r.institution),
      detail: str(r.detail),
    })),
    timeline: (await selectAll(x, "doctor_timeline")).map((r) => ({
      year: str(r.year),
      title: str(r.title),
      detail: str(r.detail),
    })),
    achievements: (await selectAll(x, "doctor_achievements")).map((r) => ({
      title: str(r.title),
      detail: str(r.detail),
    })),
    mission: {
      mission: str(d.mission),
      vision: str(d.vision),
      values: (await selectAll(x, "doctor_values")).map((r) => ({
        title: str(r.title),
        detail: str(r.detail),
      })),
    },
    gallery: (await selectAll(x, "doctor_gallery")).map((r) => ({
      slot: str(r.slot),
      label: str(r.label),
    })),
  };
}

async function writeDoctor(conn: Conn, data: Row): Promise<void> {
  const biography = (data.biography as Row) ?? {};
  const mission = (data.mission as Row) ?? {};
  await upsert(conn, "doctor", "id", {
    id: 1,
    bio_intro: str(biography.intro),
    mission: str(mission.mission),
    vision: str(mission.vision),
  });
  await replaceAll(conn, "doctor_bio_paragraphs",
    arr(biography.paragraphs as string[]).map((t) => ({ text: t })));
  await replaceAll(conn, "doctor_values",
    arr(mission.values as Row[]).map((v) => ({ title: str(v.title), detail: str(v.detail) })));
  await replaceAll(conn, "doctor_education",
    arr(data.education as Row[]).map((e) => ({
      year: str(e.year),
      qualification: str(e.qualification),
      institution: str(e.institution),
      detail: str(e.detail),
    })));
  await replaceAll(conn, "doctor_timeline",
    arr(data.timeline as Row[]).map((t) => ({ year: str(t.year), title: str(t.title), detail: str(t.detail) })));
  await replaceAll(conn, "doctor_achievements",
    arr(data.achievements as Row[]).map((a) => ({ title: str(a.title), detail: str(a.detail) })));
  await replaceAll(conn, "doctor_gallery",
    arr(data.gallery as Row[]).map((g) => ({ slot: str(g.slot), label: str(g.label) })));
}

/* =============================== clinic =============================== */

async function readClinic(x: Executor): Promise<Row> {
  const c = (await select(x, `SELECT * FROM ${bt("clinic")} WHERE ${bt("id")}=1`))[0] ?? {};
  return {
    phone: str(c.phone),
    whatsapp: str(c.whatsapp),
    email: str(c.email),
    addressLine1: str(c.address_line1),
    addressLine2: str(c.address_line2),
    city: str(c.city),
    district: str(c.district),
    state: str(c.state),
    postalCode: str(c.postal_code),
    mapQuery: str(c.map_query),
    hours: (await selectAll(x, "clinic_hours")).map((r) => ({
      days: str(r.days),
      time: str(r.time),
    })),
    stats: (await selectAll(x, "clinic_stats")).map((r) => ({
      value: Number(r.value),
      suffix: str(r.suffix),
      label: str(r.label),
    })),
  };
}

async function writeClinic(conn: Conn, data: Row): Promise<void> {
  await upsert(conn, "clinic", "id", {
    id: 1,
    phone: str(data.phone),
    whatsapp: str(data.whatsapp),
    email: str(data.email),
    address_line1: str(data.addressLine1),
    address_line2: str(data.addressLine2),
    city: str(data.city),
    district: str(data.district),
    state: str(data.state),
    postal_code: str(data.postalCode),
    map_query: str(data.mapQuery),
  });
  await replaceAll(conn, "clinic_hours",
    arr(data.hours as Row[]).map((h) => ({ days: str(h.days), time: str(h.time) })));
  await replaceAll(conn, "clinic_stats",
    arr(data.stats as Row[]).map((s) => ({
      value: Number(s.value) || 0,
      suffix: str(s.suffix),
      label: str(s.label),
    })));
}

/* ============================ consultation ============================ */

async function readConsultation(x: Executor): Promise<Row> {
  const c = (await select(x, `SELECT * FROM ${bt("consultation")} WHERE ${bt("id")}=1`))[0] ?? {};
  return {
    prepare: (await selectAll(x, "consultation_prepare")).map((r) => ({
      title: str(r.title),
      detail: str(r.detail),
    })),
    deliveryNote: str(c.delivery_note),
  };
}

async function writeConsultation(conn: Conn, data: Row): Promise<void> {
  await upsert(conn, "consultation", "id", {
    id: 1,
    delivery_note: str(data.deliveryNote),
  });
  await replaceAll(conn, "consultation_prepare",
    arr(data.prepare as Row[]).map((p) => ({ title: str(p.title), detail: str(p.detail) })));
}

/* =============================== gallery =============================== */

async function readGallery(x: Executor): Promise<Row[]> {
  return (await selectAll(x, "gallery_items")).map((r) => ({
    image: str(r.image),
    label: str(r.label),
  }));
}

async function writeGallery(conn: Conn, data: Row[]): Promise<void> {
  await replaceAll(conn, "gallery_items",
    arr(data).map((g) => ({ image: str(g.image), label: str(g.label) })));
}

/* ============================= appointments ============================= */

async function readAppointments(x: Executor): Promise<Row[]> {
  const parents = await select(
    x,
    `SELECT * FROM ${bt("appointments")} ORDER BY ${bt("position")}`,
  );
  const out: Row[] = [];
  for (const a of parents) {
    const id = String(a.id);
    out.push({
      id,
      createdAt: str(a.created_at),
      status: a.status,
      mode: a.mode,
      concern: str(a.concern),
      date: str(a.date),
      time: str(a.time),
      name: str(a.name),
      phone: str(a.phone),
      email: str(a.email),
      age: str(a.age),
      gender: str(a.gender),
      notes: str(a.notes),
      files: (await selectKeyed(x, "appointment_files", "appointment_id", id)).map((r) =>
        str(r.filename),
      ),
    });
  }
  return out;
}

async function writeAppointments(conn: Conn, data: Row[]): Promise<void> {
  await deleteMissing(conn, "appointments", "id", data.map((a) => String(a.id)));
  for (let i = 0; i < data.length; i++) {
    const a = data[i];
    const id = String(a.id);
    await upsert(conn, "appointments", "id", {
      id,
      created_at: str(a.createdAt),
      status: a.status,
      mode: a.mode,
      concern: str(a.concern),
      date: str(a.date),
      time: str(a.time),
      name: str(a.name),
      phone: str(a.phone),
      email: str(a.email),
      age: str(a.age),
      gender: str(a.gender),
      notes: str(a.notes),
      position: i,
    });
    await replaceKeyed(conn, "appointment_files", "appointment_id", id,
      arr(a.files as string[]).map((f) => ({ filename: f })));
  }
}

/* ============================== enquiries ============================== */

async function readEnquiries(x: Executor): Promise<Row[]> {
  const rows = await select(
    x,
    `SELECT * FROM ${bt("enquiries")} ORDER BY ${bt("position")}`,
  );
  return rows.map((r) => ({
    id: String(r.id),
    createdAt: str(r.created_at),
    read: Boolean(r.read),
    name: str(r.name),
    phone: str(r.phone),
    email: str(r.email),
    reason: str(r.reason),
    message: str(r.message),
  }));
}

async function writeEnquiries(conn: Conn, data: Row[]): Promise<void> {
  await deleteMissing(conn, "enquiries", "id", data.map((e) => String(e.id)));
  for (let i = 0; i < data.length; i++) {
    const e = data[i];
    await upsert(conn, "enquiries", "id", {
      id: String(e.id),
      created_at: str(e.createdAt),
      read: bool(e.read),
      name: str(e.name),
      phone: str(e.phone),
      email: str(e.email),
      reason: str(e.reason),
      message: str(e.message),
      position: i,
    });
  }
}

/* ============================== registry ============================== */

export type Repository = {
  read: (x: Executor) => Promise<unknown>;
  write: (conn: Conn, data: never) => Promise<void>;
};

export const repositories: Record<string, Repository> = {
  conditions: { read: readConditions, write: writeConditions as Repository["write"] },
  products: { read: readProducts, write: writeProducts as Repository["write"] },
  posts: { read: readPosts, write: writePosts as Repository["write"] },
  testimonials: { read: readTestimonials, write: writeTestimonials as Repository["write"] },
  faqs: { read: readFaqs, write: writeFaqs as Repository["write"] },
  doctor: { read: readDoctor, write: writeDoctor as Repository["write"] },
  clinic: { read: readClinic, write: writeClinic as Repository["write"] },
  consultation: { read: readConsultation, write: writeConsultation as Repository["write"] },
  gallery: { read: readGallery, write: writeGallery as Repository["write"] },
  appointments: { read: readAppointments, write: writeAppointments as Repository["write"] },
  enquiries: { read: readEnquiries, write: writeEnquiries as Repository["write"] },
};
