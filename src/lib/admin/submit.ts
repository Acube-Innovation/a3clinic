"use server";

import { randomUUID } from "node:crypto";
import { readDoc, writeDoc } from "./store";
import type { AppointmentRequest, Enquiry } from "./inbox-types";

/**
 * Public submission endpoints for the booking wizard and contact form.
 * Deliberately NO auth — patients submit these. Server-side validation here is
 * the control; the client-side checks are only a convenience.
 */

const PHONE = /^(\+?91)?[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value: unknown, max = 2000): string {
  return String(value ?? "").trim().slice(0, max);
}

export async function submitBooking(input: {
  mode: string;
  concern: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  age: string;
  gender: string;
  notes: string;
  files: string[];
}): Promise<{ ok: boolean; error?: string }> {
  const name = clean(input.name, 120);
  const phone = clean(input.phone, 20).replace(/[\s-]/g, "");
  const email = clean(input.email, 200);

  if (!name || !PHONE.test(phone) || !EMAIL.test(email)) {
    return { ok: false, error: "Please check your name, phone and email." };
  }
  if (input.mode !== "online" && input.mode !== "clinic") {
    return { ok: false, error: "Please choose a consultation mode." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !/^\d{2}:\d{2}$/.test(input.time)) {
    return { ok: false, error: "Please choose a valid date and time." };
  }

  const appointment: AppointmentRequest = {
    id: `A-${randomUUID().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
    status: "pending",
    mode: input.mode,
    concern: clean(input.concern, 60),
    date: input.date,
    time: input.time,
    name,
    phone,
    email,
    age: clean(input.age, 3),
    gender: clean(input.gender, 20),
    notes: clean(input.notes),
    files: (input.files ?? []).slice(0, 10).map((f) => clean(f, 200)),
  };

  const all = await readDoc<AppointmentRequest[]>("appointments", []);
  all.unshift(appointment);
  await writeDoc("appointments", all);

  return { ok: true };
}

export async function submitEnquiry(input: {
  name: string;
  phone: string;
  email: string;
  reason: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const name = clean(input.name, 120);
  const phone = clean(input.phone, 20).replace(/[\s-]/g, "");
  const message = clean(input.message);

  if (!name || !PHONE.test(phone) || !message) {
    return { ok: false, error: "Please check your name, phone and message." };
  }

  const enquiry: Enquiry = {
    id: `E-${randomUUID().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
    read: false,
    name,
    phone,
    email: clean(input.email, 200),
    reason: clean(input.reason, 40),
    message,
  };

  const all = await readDoc<Enquiry[]>("enquiries", []);
  all.unshift(enquiry);
  await writeDoc("enquiries", all);

  return { ok: true };
}
