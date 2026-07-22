# Dr. Riji's Health Care — website

Premium marketing site, product store, booking flow and patient-portal preview for
a homeopathic clinic in Kattakkada, Kerala, specialising in hair and scalp treatment.

**Status: complete front-end plus a working admin panel.** Every page is built
and production-quality. Content, appointments and enquiries persist to a
file-backed store managed at `/admin` — see [Admin panel](#admin-panel). What
still needs a real backend is listed in [Backend contract](#backend-contract).

```bash
npm install
npm run dev     # http://localhost:3000 → redirects to /en
npm run build   # the real gate: type-checks and prerenders every route
npm run lint    # next build does NOT lint in Next 16 — run this separately
npm start
```

---

## ⚠️ Compliance — read before launch

Three things on this site carry regulatory risk in India and **must be reviewed by
the clinic's own legal counsel** before going live. They are built as requested,
worded as defensively as possible, and flagged in code.

**1. Before/after imagery and testimonials.** India's Drugs & Magic Remedies
(Objectionable Advertisements) Act 1954 and NMC advertising regulations restrict
before/after photographs, patient testimonials and outcome claims by medical
practitioners.

- `src/components/sections/BeforeAfter.tsx` is framed as *how progress is
  documented*, not as an advertisement of results, and carries a permanent
  "results vary" disclaimer. **Do not remove that disclaimer.**
- `src/data/testimonials.ts` quotes describe the *experience of care*, never
  outcomes. Every real quote needs written, signed, revocable consent naming
  this specific use.
- Every real patient photograph needs the same written consent.

**2. Unverified claims.** `clinicStats` in `src/data/testimonials.ts` (years in
practice, consultations, countries) and all credentials in `src/data/doctor.ts`
are **placeholders**. Misstated medical qualifications carry consequences well
beyond a website error. Verify every one against certificates.

**3. Privacy and health data.** `/privacy` and `/terms` are structured starting
points, not legal advice. Medical records and uploaded reports are sensitive
personal data under the DPDP Act 2023.

Editorial copy throughout deliberately avoids cure claims, guaranteed outcomes and
fixed-result packages, and repeatedly states that homeopathic treatment complements
rather than replaces conventional care. Keep it that way.

---

## Stack

| Package | Version | Notes |
|---|---|---|
| `next` | 16.2.10 | App Router + Turbopack |
| `react` | 19.2.x | |
| `tailwindcss` | 4.x | CSS-first `@theme` — **there is no `tailwind.config.ts`** |
| `motion` | 12.x | the renamed `framer-motion` |
| `next-intl` | 4.x | `/en` and `/ml` routing |
| `lucide-react` | 1.x | UI icons |
| `@icons-pack/react-simple-icons` | 13.x | brand icons — lucide 1.0 removed its own |

### Four things that will bite you

1. **`params` and `searchParams` are Promises and must be awaited.** Next 15's
   sync shim was removed in 16 — this is a hard error, not a warning.
2. **Middleware is `src/proxy.ts` exporting `proxy`** — but the next-intl import
   is still `next-intl/middleware`. Only the filename moved.
3. **Use `@theme inline`, not `@theme`, for any token referencing another
   variable** (all `next/font` variables). Plain `@theme` resolves fonts wrongly
   with *no build error*.
4. **`next lint` no longer exists** and `next build` does not lint. Run
   `npm run lint` yourself or in CI.

---

## Architecture

```
messages/en.json, ml.json   UI chrome copy (ml is English pending translation)
src/
├─ app/[locale]/            every route; layout.tsx is the root (no app/layout.tsx)
├─ components/
│   ├─ ui/                  Button, Section, Card, Field, Accordion, PlaceholderImage
│   ├─ motion/Reveal.tsx    the ONLY place whileInView is used
│   ├─ layout/              Header, Footer, MobileNav, PageHero, Breadcrumbs
│   ├─ sections/            one component per homepage section
│   ├─ shop/  booking/  blog/  portal/  legal/  forms/
├─ data/                    ← the backend seam (see below)
├─ lib/                     site.ts (clinic constants), seo.ts (JSON-LD), cart-context
└─ i18n/                    routing, navigation, request
```

**Server-first.** Pages are Server Components. `"use client"` sits as low as
possible — motion wrappers, cart, forms, nav toggles.

**Content lives in two places, deliberately.** UI chrome (nav, buttons, labels) is
in `messages/*.json` for translation. Catalogue and editorial content (products,
conditions, posts) is in typed `src/data/*` modules — that is where a CMS would
take over, and product descriptions do not belong in i18n JSON.

### Design system

All tokens are in `src/app/globals.css` under `@theme`.

- **Teal `#044B4D` = authority.** Primary surfaces, CTAs, scrolled header.
- **Olive `#7A9833` = accent only.** Hairlines, icon strokes, ticks, small badges.
  Never a large fill. If a block of olive reads as a "section colour", it is wrong.
- Playfair Display for headings, Inter for body/UI.
- `--text-display` is capped at `4.25rem` so "Whole-body Healing." holds one line
  in the hero. Raising it re-introduces a three-line wrap.
- `html { overflow-x: clip }` — floating cards and ambient blobs deliberately
  bleed past the container. Deliberately not `hidden`, which would break every
  `position: sticky` on the site.

---

## Photography

No stock images are used. `<PlaceholderImage>` renders deterministic in-palette
artwork at the true aspect ratio, so the layout can be design-reviewed today.

Every instance carries the description of the shot that belongs there. **Get the
full shot list with:**

```bash
grep -rho 'slot="[^"]*"' src/ | sort -u
```

Replace each with a real image, then delete the component.

---

## Backend contract

Out of scope for this build; `src/data/*` defines the exact shape each needs.

| Area | Currently | Needs |
|---|---|---|
| Products, conditions, posts | admin-editable JSON store with in-code defaults | database once multiple editors/instances exist |
| Cart | React context + `localStorage` | server cart, stock checks |
| Checkout | **no payment taken** | Razorpay, orders, fulfilment |
| Booking | persists to the admin appointments inbox | per-date availability, slot hold + confirm (guard double-booking), payment, email/SMS |
| Report upload | filenames listed, nothing stored | authenticated upload to **private, access-controlled** storage — health data must never be world-readable |
| Patient portal | signed-out preview, sample data | authentication, per-patient authorisation, audit logging |
| Video consultation | play button is a placeholder | real call infrastructure |
| Contact form | persists to the admin enquiries inbox | email notification to staff |
| Newsletter | validate + success state only | mailing-list provider |

Client-side validation in the forms is a convenience, never a control — **mirror
every rule server-side.**

---

## Verified

Checked against a real Chromium instance driving the production build:

- `npm run build` — clean; all 60+ routes prerendered static in both locales.
- `npm run lint` — clean.
- **JSON-LD** — `WebSite`, `MedicalClinic`+`LocalBusiness`, `Physician`, `Product`,
  `FAQPage`, `MedicalCondition`, `BlogPosting`, `BreadcrumbList` all emit and parse.
- **Cart** — add, badge, drawer, quantity, free-shipping threshold, and persistence
  across a hard reload.
- **Booking** — validation blocks an incomplete step and the wizard does not advance.
- **Responsive** — no page can be scrolled sideways at 375 / 768 / 1440 / 1920.
- **Sticky + header** — sticky panels pin correctly; header switches to dark glass
  on scroll.
- **a11y** — first tab stop is the skip link; no console errors on any route.
- Scroll-reveal content has a `<noscript>` fallback, so **content never depends on
  an animation having run**.
- **Admin** — guard redirects, wrong-password rejection, login, product price
  edit propagating to the live shop page, booking → appointments inbox → status
  change, contact form → enquiries inbox, and logout, all driven through a real
  Chromium session.

Not yet done: Lighthouse, axe audit, and a real screen-reader pass.

---

## Admin panel

`/admin` — clinic staff panel. Credentials live in `.env.local` (see
`.env.example`); the dev defaults are `admin@drrijis.clinic` / `DrRiji@2026`.
**Change these before any deployment.**

- **Layout** — section list on the left (Dashboard, Appointments, Enquiries,
  then all content types), the selected page's editor on the right.
- **Content editing** — Treatments & Conditions, Shop Products, Blog Posts,
  Testimonials, Homepage FAQs, the Doctor Profile, Clinic Photos, the
  Consultation Page and Clinic & Contact settings are all editable through
  schema-driven forms (`src/lib/admin/schemas.ts`). Saving writes to a **fully
  normalized MySQL/MariaDB schema** — one table per section plus a child table
  for every nested list (`condition_faqs`, `product_ingredients`, `post_blocks`,
  `doctor_timeline`, …), configured via `MYSQL_*` env vars (see `.env.example`)
  — and revalidates the live site immediately. The storage layer lives under
  `src/lib/admin/db/*` behind the document-shaped `readDoc`/`writeDoc` façade in
  `store.ts`, so pages and forms are unaware of the schema. Without `MYSQL_*`
  set, the store falls back to JSON files under `/content`. A section with no
  rows yet falls back to the in-code defaults in `src/data/*`, so an empty
  database is never an error.
  - **Setup**: create the database and user (any MySQL 8 / MariaDB 10.x,
    including AWS RDS), fill `MYSQL_*` in `.env.local`, then load existing data
    with `npm run db:migrate` (re-runnable; decomposes the current documents/JSON
    into the normalized tables via the app's own repositories). Back up the
    database and `public/uploads` together.
- **Clinic Photos** — image uploads (JPG/PNG/WebP ≤ 5 MB) stored in
  `public/uploads` and served statically from the site root at `/uploads/<name>`.
  They render in the About page gallery; placeholders show until the first upload.
  Runtime-written `public/` files serve correctly under `next start` on a
  persistent-disk host (EC2 / Lightsail); avoid ephemeral/serverless hosts.
- **Before & After** — photo pairs live ON each condition (edited in the
  condition's own form, "Before & after photos"). Each condition page shows its
  pairs in a "Documenting progress" section; the homepage/hair-treatment
  section aggregates pairs across all conditions. Every upload is
  **watermarked server-side by sharp** (tiled diagonal clinic name + © chip
  baked into the pixels — a CSS overlay would be strippable) and right-click/
  drag are disabled as a soft deterrent. Nothing prevents screenshots; the
  watermark travels with every copy. The "results vary" disclaimer renders
  permanently alongside (it is part of `ResultPairsGrid` by design), and real
  patient pairs require written consent — see § Compliance.
- **Clinic & Contact** — phone, WhatsApp, email, address, hours, map query and
  the homepage statistics, threaded through the header, footer, contact page,
  location section, booking CTA/wizard and clinic JSON-LD. Marking a condition
  **Featured** places it in the header's Treatments dropdown.
- **Appointments** — the public booking wizard now persists requests. Staff see
  them instantly, expand for full details (including report filenames), move
  them through pending → confirmed → completed/cancelled, and jump straight to
  WhatsApp with the patient.
- **Enquiries** — contact-form messages land here with read/unread state and
  call/WhatsApp/email shortcuts.
- **Auth** — single admin identity from env vars, HMAC-signed httpOnly session
  cookie (8 h), timing-safe comparisons, every server action re-checks the
  session. The next-intl proxy skips `/admin` entirely.

### Before real-world use

This is a working demo of the admin layer, honest about its limits:

1. **Single shared login.** Real use needs per-user accounts, password hashing
   at rest, rate limiting and 2FA — swap `src/lib/admin/auth.ts` for a proper
   auth provider.
2. **File storage.** `/content/*.json` is fine for one server; move to a
   database before multiple instances or concurrent editors (writes are
   last-wins with no locking).
3. **Patient data.** Appointments and enquiries are sensitive personal data
   under the DPDP Act 2023: add audit logging, retention rules and encrypted
   backups before storing real patients.
4. **Report uploads** still transmit filenames only — actual file upload needs
   authenticated private storage.

---

## TODO(client)

`grep -rn "TODO(client)" src/` — 16 markers. The important ones:

- `src/lib/site.ts` — **live domain** (used for canonicals, OG, sitemap and every
  JSON-LD `@id`), email, surveyed clinic coordinates, registration number.
- `src/data/doctor.ts` — all qualifications, institutions and dates.
- `src/data/testimonials.ts` — all clinic statistics.
- `src/data/faqs.ts` — consultation fees. Patients look for this before booking and
  its absence is a common reason for drop-off.
- `messages/ml.json` — currently English. Needs a native Malayalam speaker; medical
  copy especially.
- `public/og-default.png` — referenced by metadata, not yet created.
