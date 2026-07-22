import "server-only";
import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Minimal credential auth for the admin panel.
 *
 * DEMO SCOPE: a single admin identity from .env.local and an HMAC-signed,
 * httpOnly session cookie. Before real deployment this should move to a proper
 * auth provider with per-user accounts, rate limiting and audit logging —
 * see README § Admin.
 */

const COOKIE = "drr-admin-session";
const SESSION_HOURS = 8;

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set — see .env.example");
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) return false;
  // Evaluate both sides regardless, to keep timing uniform.
  const emailOk = safeEqual(email.trim().toLowerCase(), expectedEmail.toLowerCase());
  const passwordOk = safeEqual(password, expectedPassword);
  return emailOk && passwordOk;
}

export async function createSession(): Promise<void> {
  const expires = Date.now() + SESSION_HOURS * 3600_000;
  const token = `${expires}.${sign(String(expires))}`;
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // NOT tied to NODE_ENV: this build is served over plain http on the LAN,
    // and browsers silently drop Secure cookies on http for any origin except
    // localhost — logins would appear to work, then every action would fail.
    // When deploying behind HTTPS, set ADMIN_COOKIE_SECURE=true in .env.
    secure: process.env.ADMIN_COOKIE_SECURE === "true",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function hasValidSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return false;

  const [expires, signature] = token.split(".");
  if (!expires || !signature) return false;
  if (!safeEqual(signature, sign(expires))) return false;
  return Number(expires) > Date.now();
}

/** Throws unless a valid admin session exists. Call first in every action. */
export async function requireAdmin(): Promise<void> {
  if (!(await hasValidSession())) {
    throw new Error("Not authorised");
  }
}
