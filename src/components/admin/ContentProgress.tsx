import Link from "next/link";
import { FileText, MessageSquareQuote, Package, Stethoscope } from "lucide-react";

import { getConditions } from "@/data/conditions";
import { getProducts } from "@/data/products";
import { getPosts } from "@/data/posts";
import { getTestimonials } from "@/data/testimonials";

/**
 * Content-readiness overview: one thin progress bar per collection and a
 * donut with the weighted overall percentage.
 *
 * "Complete" is concrete, not vibes — each record is scored against the
 * checklist below, a collection's percentage is the mean record score, and
 * the overall figure weights collections by record count.
 *
 * Chart conventions (see dataviz notes): single accent hue #7A9833 (validated
 * against the card surface — the brand teals read as gray at data size),
 * neutral track, every value directly labelled in ink text, no color-only
 * meaning.
 */

const has = (v: unknown): boolean =>
  Array.isArray(v) ? v.length > 0 : typeof v === "string" ? v.trim() !== "" : Boolean(v);

function score(checks: boolean[]): number {
  return checks.filter(Boolean).length / checks.length;
}

export async function ContentProgress() {
  const [conditions, products, posts, testimonials] = await Promise.all([
    getConditions(),
    getProducts(),
    getPosts(),
    getTestimonials(),
  ]);

  const rows = [
    {
      key: "conditions",
      label: "Treatments & Conditions",
      Icon: Stethoscope,
      href: "/admin/content/conditions",
      hint: "text, images, timeline & FAQs",
      scores: conditions.map((c) =>
        score([
          has(c.heroImage),
          has(c.introImage),
          has(c.symptoms),
          has(c.causes),
          has(c.treatment),
          has(c.expectedResults),
          has(c.faqs),
        ]),
      ),
    },
    {
      key: "products",
      label: "Shop Products",
      Icon: Package,
      href: "/admin/content/products",
      hint: "photo, benefits, ingredients & safety copy",
      scores: products.map((p) =>
        score([
          has(p.image),
          has(p.benefits),
          has(p.ingredients),
          has(p.directions),
          has(p.caution),
        ]),
      ),
    },
    {
      key: "posts",
      label: "Blog Posts",
      Icon: FileText,
      href: "/admin/content/posts",
      hint: "cover image, excerpt & article body",
      scores: posts.map((p) => score([has(p.image), has(p.excerpt), has(p.body)])),
    },
    {
      key: "testimonials",
      label: "Testimonials",
      Icon: MessageSquareQuote,
      href: "/admin/content/testimonials",
      hint: "quote, context & written consent",
      scores: testimonials.map((t) =>
        score([has(t.quote), has(t.context), Boolean(t.consentOnFile)]),
      ),
    },
  ].map((row) => {
    const total = row.scores.length;
    const pct =
      total === 0 ? 0 : Math.round((row.scores.reduce((a, b) => a + b, 0) / total) * 100);
    const complete = row.scores.filter((s) => s === 1).length;
    return { ...row, total, pct, complete };
  });

  const totalRecords = rows.reduce((a, r) => a + r.total, 0);
  const overall =
    totalRecords === 0
      ? 0
      : Math.round(
          rows.reduce((a, r) => a + (r.pct / 100) * r.total, 0) / totalRecords * 100,
        );

  // Donut geometry: r=50 in a 120 viewBox, 10px ring.
  const C = 2 * Math.PI * 50;
  const arc = (overall / 100) * C;

  return (
    <section
      aria-label="Content progress"
      className="mt-10 rounded-3xl bg-white p-6 ring-1 ring-line sm:p-7"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-teal-900">Content progress</h2>
        <p className="text-sm text-muted">
          {rows.reduce((a, r) => a + r.complete, 0)} of {totalRecords} items fully
          complete
        </p>
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
        {/* ------------------------------ Bars ------------------------------ */}
        <div className="flex flex-col gap-5">
          {rows.map(({ key, label, Icon, href, hint, pct, complete, total }) => (
            <Link
              key={key}
              href={href}
              className="group block rounded-2xl p-2 -m-2 transition-colors hover:bg-platinum/60"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="flex items-center gap-2.5 font-medium text-teal-900">
                  <Icon className="size-4 text-muted" strokeWidth={1.75} aria-hidden />
                  {label}
                </span>
                <span className="shrink-0 text-sm">
                  <span className="font-semibold text-teal-900">{pct}%</span>
                  <span className="ml-2 text-muted">
                    {complete}/{total} complete
                  </span>
                </span>
              </div>

              <div
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${label}: ${pct} percent complete`}
                className="mt-2 h-2.5 w-full rounded-full bg-line"
              >
                <div
                  className="h-full rounded-full bg-olive-500 transition-[width] duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <p className="mt-1.5 text-xs text-muted">Counts {hint}.</p>
            </Link>
          ))}
        </div>

        {/* ------------------------------ Donut ----------------------------- */}
        <figure className="mx-auto flex flex-col items-center gap-3 lg:px-6">
          <div className="relative">
            <svg
              width="164"
              height="164"
              viewBox="0 0 120 120"
              role="img"
              aria-label={`Overall content completion: ${overall} percent`}
            >
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#EAEDED"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#7A9833"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${arc} ${C}`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <span className="text-center">
                <span className="block font-display text-4xl text-teal-900">
                  {overall}%
                </span>
              </span>
            </div>
          </div>
          <figcaption className="text-center text-sm text-muted">
            Overall content readiness
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
