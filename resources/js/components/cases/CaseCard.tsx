import { ArrowUpRight, CalendarRange, ImageOff, UserRound } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { CompareSlider } from "@/components/cases/CompareSlider";
import { SampleBadge } from "@/components/cases/SampleBadge";
import { profileOf, type CaseCard as CaseCardData } from "@/data/cases";

/** A case in a grid: split before/after cover, condition, headline, facts. */
export function CaseCard({ item }: { item: CaseCardData }) {
  const profile = profileOf(item);

  return (
    <Link
      href={`/results/${item.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-4xl bg-white ring-1 ring-line transition-[transform,box-shadow] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative">
        {item.cover ? (
          <CompareSlider
            compact
            before={item.cover.before}
            after={item.cover.after}
            beforeLabel={item.cover.beforeLabel}
            afterLabel={item.cover.afterLabel}
            alt={item.title}
          />
        ) : (
          <div className="grid aspect-[4/3] place-items-center bg-platinum text-muted">
            <ImageOff className="size-8" strokeWidth={1.5} aria-hidden />
          </div>
        )}
        {item.sample ? <SampleBadge className="absolute bottom-4 left-4" /> : null}
      </div>

      <div className="flex flex-1 flex-col p-7">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-olive-600">
            {item.conditionName}
          </span>
          <span className="font-mono text-[0.6875rem] text-muted">{item.code}</span>
        </div>

        <div className="mt-3 flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold leading-snug text-teal-800 transition-colors duration-300 group-hover:text-teal-600">
            {item.title}
          </h3>
          <ArrowUpRight
            aria-hidden
            strokeWidth={1.75}
            className="mt-1 size-5 shrink-0 text-line transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-olive-500"
          />
        </div>

        <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
          {item.summary}
        </p>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-xs font-medium text-ink/70">
          {profile ? (
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="size-3.5 text-teal-500" aria-hidden />
              {profile}
            </span>
          ) : null}
          {item.followUp ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarRange className="size-3.5 text-teal-500" aria-hidden />
              {item.followUp} · {item.stageCount} visits
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
