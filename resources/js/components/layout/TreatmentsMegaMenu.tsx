import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Baby,
  Droplets,
  Flower2,
  HeartPulse,
  Images,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { useTranslations } from "@/i18n/intl";
import { Link } from "@/i18n/navigation";
import { categoryLabels, type ConditionCategory } from "@/data/conditions";
import { cn } from "@/lib/utils";

export type MenuCondition = {
  slug: string;
  name: string;
  category: string;
  featured: boolean;
};

const categoryOrder: ConditionCategory[] = [
  "hair",
  "skin",
  "chronic",
  "womens",
  "child",
];

const categoryIcons: Record<ConditionCategory, LucideIcon> = {
  hair: Sparkles,
  skin: Droplets,
  chronic: HeartPulse,
  womens: Flower2,
  child: Baby,
};

/**
 * Desktop "Treatments" mega-menu: a category rail on the left (hover or focus
 * switches it) and every condition in that category on the right, featured
 * ones first. Spans the header's width; the header closes it on mouse leave.
 */
export function TreatmentsMegaMenu({
  conditions,
  onNavigate,
}: {
  conditions: MenuCondition[];
  onNavigate: () => void;
}) {
  const t = useTranslations("nav");

  const groups = categoryOrder
    .map((category) => ({
      category,
      items: conditions
        .filter((c) => c.category === category)
        // Featured first, then alphabetical — stable for the rest.
        .sort(
          (a, b) =>
            Number(b.featured) - Number(a.featured) ||
            a.name.localeCompare(b.name),
        ),
    }))
    .filter((g) => g.items.length > 0);

  const [active, setActive] = useState<ConditionCategory>(
    groups[0]?.category ?? "hair",
  );
  const current = groups.find((g) => g.category === active) ?? groups[0];

  if (!current) return null;
  const ActiveIcon = categoryIcons[current.category];

  return (
    <div className="absolute inset-x-0 top-full pt-3">
      <div className="container-page">
        <div className="mega-menu-enter overflow-hidden rounded-4xl bg-white shadow-lift ring-1 ring-line">
          <div className="grid grid-cols-[18rem_1fr] xl:grid-cols-[18rem_1fr_17rem]">
            {/* ---------- Category rail ---------- */}
            <div className="flex flex-col gap-1 border-r border-line bg-platinum p-3">
              <p className="px-4 pb-2 pt-3 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                {t("browseByCategory")}
              </p>
              {groups.map(({ category, items }) => {
                const Icon = categoryIcons[category];
                const isActive = category === current.category;
                return (
                  <button
                    key={category}
                    type="button"
                    onMouseEnter={() => setActive(category)}
                    onFocus={() => setActive(category)}
                    onClick={() => setActive(category)}
                    aria-pressed={isActive}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-[background-color,box-shadow,color] duration-200",
                      isActive
                        ? "bg-white text-teal-800 shadow-soft ring-1 ring-line"
                        : "text-ink/75 hover:bg-white/70 hover:text-teal-800",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-xl transition-colors duration-200",
                        isActive
                          ? "bg-teal-800 text-white"
                          : "bg-teal-50 text-teal-700 group-hover:bg-teal-100",
                      )}
                    >
                      <Icon className="size-4.5" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="flex-1 whitespace-nowrap text-[0.9375rem] font-medium">
                      {categoryLabels[category]}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                        isActive
                          ? "bg-olive-100 text-olive-700"
                          : "text-muted",
                      )}
                    >
                      {items.length}
                    </span>
                  </button>
                );
              })}

              <Link
                href="/results"
                onClick={onNavigate}
                className="group mt-auto flex items-center gap-3 rounded-2xl border border-dashed border-teal-200 px-3 py-2.5 text-[0.9375rem] font-medium text-teal-800 transition-colors duration-200 hover:border-teal-300 hover:bg-white"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-olive-100 text-olive-700">
                  <Images className="size-4.5" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="flex-1">{t("results")}</span>
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/conditions"
                onClick={onNavigate}
                className="group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-teal-800 transition-colors duration-200 hover:bg-white"
              >
                {t("allConditions")}
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>

            {/* ---------- Conditions in the active category ---------- */}
            <div className="flex max-h-[min(34rem,70svh)] flex-col p-7">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                  <ActiveIcon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="text-lg font-semibold text-teal-800">
                  {categoryLabels[current.category]}
                </h3>
                <span aria-hidden className="rule-olive flex-1" />
              </div>

              <ul
                key={current.category}
                className={cn(
                  "mega-menu-list mt-5 grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-x-6 gap-y-0.5 overflow-y-auto pr-1 2xl:grid-cols-3",
                  // Long lists scroll: fade the bottom edge as the cue.
                  current.items.length > 20 &&
                    "pb-8 [mask-image:linear-gradient(to_bottom,black_85%,transparent)]",
                )}
              >
                {current.items.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/conditions/${c.slug}`}
                      onClick={onNavigate}
                      className="group flex items-center gap-2 rounded-xl px-3 py-2 text-[0.9375rem] text-ink/80 transition-colors duration-200 hover:bg-teal-50 hover:text-teal-800"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "size-1.5 shrink-0 rounded-full transition-colors duration-200",
                          c.featured
                            ? "bg-olive-500"
                            : "bg-teal-200 group-hover:bg-teal-500",
                        )}
                      />
                      <span className="flex-1 truncate" title={c.name}>
                        {c.name}
                      </span>
                      <ArrowUpRight
                        aria-hidden
                        strokeWidth={1.75}
                        className="size-3.5 shrink-0 text-teal-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ---------- Programme promo ---------- */}
            <div className="hidden p-3 xl:block">
              <Link
                href="/hair-treatment"
                onClick={onNavigate}
                className="group relative flex h-full flex-col justify-end overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white"
              >
                <span aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
                <span aria-hidden className="absolute -bottom-12 -left-8 size-36 rounded-full bg-olive-400/25 blur-2xl" />
                <Sparkles className="relative mb-auto size-7 text-olive-200" strokeWidth={1.5} aria-hidden />
                <span className="relative text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-teal-100/80">
                  {t("ourSpeciality")}
                </span>
                <span className="relative mt-2 text-xl font-semibold leading-snug">
                  {t("hairTreatment")}
                </span>
                <span className="relative mt-2 text-sm leading-relaxed text-teal-50/80">
                  {t("hairTreatmentBlurb")}
                </span>
                <span className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-olive-200">
                  {t("explore")}
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
