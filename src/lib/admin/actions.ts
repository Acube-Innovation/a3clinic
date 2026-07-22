"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  checkCredentials,
  createSession,
  destroySession,
  requireAdmin,
} from "./auth";
import { readDoc, writeDoc } from "./store";
import { getCollection, type CollectionDef } from "./schemas";
import { slugify } from "@/lib/utils";
import { getProductDefaults } from "@/data/products";
import { getConditionDefaults } from "@/data/conditions";
import { getPostDefaults } from "@/data/posts";
import { getTestimonialDefaults } from "@/data/testimonials";
import { getFaqDefaults } from "@/data/faqs";
import { getDoctorDefaults, type DoctorProfile } from "@/data/doctor";
import { getClinicDefaults } from "@/data/clinic";
import { getGalleryDefaults } from "@/data/gallery";
import { getConsultationDefaults } from "@/data/consultation";
import type {
  AppointmentRequest,
  AppointmentStatus,
  Enquiry,
} from "./inbox-types";

type Rec = Record<string, unknown>;

/* ============================== auth ==================================== */

export async function loginAction(
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!checkCredentials(email, password)) {
    return { error: "Incorrect email or password." };
  }

  await createSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

/* ============================ content =================================== */

/**
 * Defaults per collection so a first edit starts from the live in-code
 * content rather than an empty store.
 */
function defaultsFor(key: string): unknown {
  switch (key) {
    case "products":
      return getProductDefaults();
    case "conditions":
      return getConditionDefaults();
    case "posts":
      return getPostDefaults();
    case "testimonials":
      return getTestimonialDefaults();
    case "faqs":
      return getFaqDefaults();
    case "doctor":
      return getDoctorDefaults();
    case "clinic":
      return getClinicDefaults();
    case "gallery":
      return getGalleryDefaults();
    case "consultation":
      return getConsultationDefaults();
    default:
      throw new Error(`Unknown collection: ${key}`);
  }
}

/**
 * A saved record must satisfy the site's type shape even when the admin left
 * optional sections empty — pages call .map on list fields unconditionally.
 * Build a blank from the schema (arrays for lines/repeaters, false for
 * toggles), add per-collection fields that exist outside the form, then let
 * the stored + submitted values override it.
 */
const extraBlanks: Record<string, Rec> = {
  products: { rating: { value: 0, count: 0 }, reviews: [], related: [] },
  posts: { readingMinutes: 3 },
};

function blankFor(def: CollectionDef): Rec {
  const blank: Rec = {};
  for (const field of def.fields) {
    if (field.kind === "lines" || field.kind === "repeater") blank[field.name] = [];
    else if (field.kind === "toggle") blank[field.name] = false;
    else if (
      field.kind === "text" ||
      field.kind === "textarea" ||
      field.kind === "select" ||
      field.kind === "image"
    )
      blank[field.name] = "";
  }
  return { ...blank, ...(extraBlanks[def.key] ?? {}) };
}

function revalidateSite(): void {
  // Content appears across many routes (home sections, listings, details) —
  // invalidate the whole tree rather than tracking a path matrix.
  revalidatePath("/", "layout");
}

export async function listRecords(key: string): Promise<Rec[]> {
  await requireAdmin();
  const def = getCollection(key);
  if (!def || def.kind !== "collection") throw new Error("Unknown collection");
  return readDoc<Rec[]>(key, defaultsFor(key) as Rec[]);
}

/** Singleton documents mapped to their flat form shape. */
export async function getSingletonForm(key: string): Promise<Rec> {
  await requireAdmin();

  if (key === "faqs") {
    const items = await readDoc(key, defaultsFor(key));
    return { items } as Rec;
  }

  if (key === "clinic" || key === "consultation") {
    // Merge over defaults so newly-added fields appear in older documents.
    const stored = await readDoc<Rec>(key, {} as Rec);
    return { ...(defaultsFor(key) as Rec), ...stored };
  }

  if (key === "gallery") {
    const items = await readDoc(key, defaultsFor(key));
    return { items } as Rec;
  }

  if (key === "doctor") {
    const doc = await readDoc<DoctorProfile>(key, defaultsFor(key) as DoctorProfile);
    return {
      bioIntro: doc.biography.intro,
      bioParagraphs: doc.biography.paragraphs,
      missionText: doc.mission.mission,
      visionText: doc.mission.vision,
      values: doc.mission.values,
      education: doc.education,
      timeline: doc.timeline,
      achievements: doc.achievements,
    };
  }

  throw new Error("Unknown singleton");
}

export async function saveSingleton(
  key: string,
  form: Rec,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  if (key === "faqs" || key === "gallery") {
    await writeDoc(key, form.items ?? []);
  } else if (key === "clinic" || key === "consultation") {
    const def = getCollection(key);
    await writeDoc(key, { ...(def ? blankFor(def) : {}), ...form });
  } else if (key === "doctor") {
    const current = await readDoc<DoctorProfile>(
      key,
      defaultsFor(key) as DoctorProfile,
    );
    const next: DoctorProfile = {
      ...current,
      biography: {
        intro: String(form.bioIntro ?? ""),
        paragraphs: (form.bioParagraphs ?? []) as string[],
      },
      mission: {
        mission: String(form.missionText ?? ""),
        vision: String(form.visionText ?? ""),
        values: (form.values ?? []) as DoctorProfile["mission"]["values"],
      },
      education: (form.education ?? []) as DoctorProfile["education"],
      timeline: (form.timeline ?? []) as DoctorProfile["timeline"],
      achievements: (form.achievements ?? []) as DoctorProfile["achievements"],
    };
    await writeDoc(key, next);
  } else {
    return { ok: false, error: "Unknown singleton" };
  }

  revalidateSite();
  return { ok: true };
}

export async function saveRecord(
  key: string,
  slug: string | null,
  record: Rec,
): Promise<{ ok: boolean; slug?: string; error?: string }> {
  await requireAdmin();
  const def = getCollection(key);
  if (!def || def.kind !== "collection") {
    return { ok: false, error: "Unknown collection" };
  }

  const title = String(record[def.titleField] ?? "").trim();
  if (!title) {
    return { ok: false, error: `The ${def.noun} needs a ${def.titleField}.` };
  }

  const records = await readDoc<Rec[]>(key, defaultsFor(key) as Rec[]);

  if (slug) {
    const index = records.findIndex((r) => r.slug === slug);
    if (index === -1) return { ok: false, error: "Record no longer exists." };
    records[index] = { ...blankFor(def), ...records[index], ...record, slug };
    await writeDoc(key, records);
    revalidateSite();
    return { ok: true, slug };
  }

  // New record: derive a unique slug from the title.
  let candidate = slugify(title);
  let n = 2;
  while (records.some((r) => r.slug === candidate)) {
    candidate = `${slugify(title)}-${n++}`;
  }
  records.unshift({ ...blankFor(def), ...record, slug: candidate });
  await writeDoc(key, records);
  revalidateSite();
  return { ok: true, slug: candidate };
}

export async function deleteRecord(
  key: string,
  slug: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const def = getCollection(key);
  if (!def || def.kind !== "collection") {
    return { ok: false, error: "Unknown collection" };
  }

  const records = await readDoc<Rec[]>(key, defaultsFor(key) as Rec[]);
  const next = records.filter((r) => r.slug !== slug);
  if (next.length === records.length) {
    return { ok: false, error: "Record not found." };
  }
  await writeDoc(key, next);
  revalidateSite();
  return { ok: true };
}

/* ====================== appointments & enquiries ======================== */

export async function getAppointments(): Promise<AppointmentRequest[]> {
  await requireAdmin();
  return readDoc<AppointmentRequest[]>("appointments", []);
}

export async function setAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const all = await readDoc<AppointmentRequest[]>("appointments", []);
  const item = all.find((a) => a.id === id);
  if (!item) return { ok: false };
  item.status = status;
  await writeDoc("appointments", all);
  return { ok: true };
}

export async function getEnquiries(): Promise<Enquiry[]> {
  await requireAdmin();
  return readDoc<Enquiry[]>("enquiries", []);
}

export async function setEnquiryRead(
  id: string,
  read: boolean,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const all = await readDoc<Enquiry[]>("enquiries", []);
  const item = all.find((e) => e.id === id);
  if (!item) return { ok: false };
  item.read = read;
  await writeDoc("enquiries", all);
  return { ok: true };
}
