import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ImageOff, Plus } from "lucide-react";

import { getCollection } from "@/lib/admin/schemas";
import { readDoc } from "@/lib/admin/store";
import { getSingletonForm } from "@/lib/admin/actions";
import { RecordForm } from "@/components/admin/RecordForm";
import { cn } from "@/lib/utils";
import { categoryLabels as conditionCategories } from "@/data/conditions";
import { categoryLabels as productCategories } from "@/data/product-types";
import { postCategoryLabels } from "@/data/posts";
import {
  defaultsForCollection,
  type AnyRecord,
} from "@/lib/admin/defaults";

export const dynamic = "force-dynamic";

/* ---------------------- per-collection list presentation ------------------- */

type Badge = { label: string; tone: "olive" | "teal" | "red" | "neutral" };

type ListMeta = {
  image?: (r: AnyRecord) => string | undefined;
  category?: (r: AnyRecord) => string | undefined;
  badges: (r: AnyRecord) => Badge[];
};

const str = (v: unknown) => (typeof v === "string" ? v : undefined);

const listMeta: Record<string, ListMeta> = {
  conditions: {
    image: (r) => str(r.introImage) || str(r.heroImage),
    category: (r) =>
      conditionCategories[r.category as keyof typeof conditionCategories],
    badges: (r) => {
      const badges: Badge[] = [];
      if (r.featured) badges.push({ label: "Featured", tone: "olive" });
      const pairs = Array.isArray(r.results)
        ? (r.results as AnyRecord[]).filter((x) => x.before && x.after).length
        : 0;
      if (pairs > 0)
        badges.push({ label: `${pairs} before/after`, tone: "teal" });
      return badges;
    },
  },
  products: {
    image: (r) => str(r.image),
    category: (r) =>
      productCategories[r.category as keyof typeof productCategories],
    badges: (r) => {
      const badges: Badge[] = [
        r.inStock
          ? { label: "In stock", tone: "teal" }
          : { label: "Out of stock", tone: "red" },
      ];
      if (r.bestseller) badges.push({ label: "Bestseller", tone: "olive" });
      else if (r.featured) badges.push({ label: "Featured", tone: "olive" });
      return badges;
    },
  },
  posts: {
    image: (r) => str(r.image),
    category: (r) =>
      postCategoryLabels[r.category as keyof typeof postCategoryLabels],
    badges: (r) => {
      const badges: Badge[] = [];
      const published = str(r.publishedAt);
      if (published && published > new Date().toISOString().slice(0, 10)) {
        badges.push({ label: "Scheduled", tone: "neutral" });
      } else {
        badges.push({ label: "Published", tone: "teal" });
      }
      if (r.featured) badges.push({ label: "Featured", tone: "olive" });
      return badges;
    },
  },
  testimonials: {
    category: (r) => str(r.location),
    badges: (r) =>
      r.consentOnFile
        ? [{ label: "Consent on file", tone: "teal" }]
        : [{ label: "Consent missing", tone: "red" }],
  },
};

const badgeTones: Record<Badge["tone"], string> = {
  olive: "bg-olive-50 text-olive-700 ring-olive-200",
  teal: "bg-teal-50 text-teal-700 ring-teal-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  neutral: "bg-platinum text-muted ring-line",
};

function Thumb({ image, title }: { image?: string; title: string }) {
  if (image) {
    return (
      // Admin uploads come from our own /uploads route.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        className="size-16 shrink-0 rounded-2xl object-cover ring-1 ring-line"
      />
    );
  }
  const initial = title.trim().charAt(0).toUpperCase() || "?";
  return (
    <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-teal-50 to-olive-100 font-display text-2xl text-teal-700 ring-1 ring-teal-100">
      {initial}
    </span>
  );
}

export default async function CollectionPage({
  params,
}: PageProps<"/admin/content/[collection]">) {
  const { collection } = await params;
  const def = getCollection(collection);
  if (!def) notFound();

  /* ---------------- singleton: edit directly on this page ---------------- */
  if (def.kind === "singleton") {
    const initial = await getSingletonForm(def.key);
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl text-teal-900">{def.label}</h1>
        <p className="mb-8 mt-1.5 text-muted">
          Changes publish to the live site as soon as you save.
        </p>
        <RecordForm def={def} slug={null} initial={initial} />
      </div>
    );
  }

  /* ------------------------- collection: list view ------------------------ */
  const records = await readDoc<AnyRecord[]>(
    def.key,
    defaultsForCollection(def.key),
  );
  const meta = listMeta[def.key];
  const missingImages =
    meta?.image ? records.filter((r) => !meta.image!(r)).length : 0;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-teal-900">{def.label}</h1>
          <p className="mt-1.5 text-muted">
            {records.length} {def.noun}
            {records.length === 1 ? "" : "s"} · changes publish on save.
            {missingImages > 0
              ? ` ${missingImages} without a photo.`
              : ""}
          </p>
        </div>

        <Link
          href={`/admin/content/${def.key}/new`}
          className="inline-flex items-center gap-2 rounded-full bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
        >
          <Plus className="size-4" strokeWidth={2.5} aria-hidden />
          Add {def.noun}
        </Link>
      </div>

      <ul className="mt-8 flex flex-col gap-2.5">
        {records.map((record) => {
          const title = String(record[def.titleField] ?? "Untitled");
          const subtitle = def.subtitleField
            ? String(record[def.subtitleField] ?? "")
            : "";
          const image = meta?.image?.(record);
          const category = meta?.category?.(record);
          const badges = meta?.badges(record) ?? [];

          return (
            <li key={String(record.slug)}>
              <Link
                href={`/admin/content/${def.key}/${record.slug}`}
                className="group flex items-center gap-4 rounded-3xl bg-white p-3.5 pr-5 ring-1 ring-line transition-all duration-150 hover:-translate-y-px hover:shadow-soft hover:ring-teal-200 sm:gap-5"
              >
                <Thumb image={image} title={title} />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-teal-900">{title}</p>
                  {subtitle ? (
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted">
                      {subtitle}
                    </p>
                  ) : null}
                  {/* Chips collapse under the title on small screens */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:hidden">
                    {category ? (
                      <span className="inline-flex rounded-full bg-platinum px-2.5 py-0.5 text-[0.6875rem] font-semibold text-muted ring-1 ring-line">
                        {category}
                      </span>
                    ) : null}
                    {badges.map((b) => (
                      <span
                        key={b.label}
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold ring-1",
                          badgeTones[b.tone],
                        )}
                      >
                        {b.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
                  {category ? (
                    <span className="inline-flex rounded-full bg-platinum px-3 py-1 text-xs font-semibold text-muted ring-1 ring-line">
                      {category}
                    </span>
                  ) : null}
                  <div className="flex gap-1.5">
                    {badges.map((b) => (
                      <span
                        key={b.label}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1",
                          badgeTones[b.tone],
                        )}
                      >
                        {b.tone === "red" && b.label.includes("missing") ? (
                          <ImageOff className="size-3" strokeWidth={2} aria-hidden />
                        ) : null}
                        {b.label}
                      </span>
                    ))}
                  </div>
                </div>

                <ChevronRight
                  aria-hidden
                  strokeWidth={2}
                  className="size-4 shrink-0 text-line transition-colors group-hover:text-olive-500"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
