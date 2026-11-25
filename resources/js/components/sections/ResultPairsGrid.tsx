import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { CompareSlider } from "@/components/cases/CompareSlider";
import { ResultsDisclaimer } from "@/components/cases/ResultsDisclaimer";
import { SampleBadge } from "@/components/cases/SampleBadge";
import type { ResultPair } from "@/data/conditions";

/**
 * Watermarked before/after pairs (from featured case reports) as compare
 * sliders, with the compliance disclaimer. The disclaimer is part of this
 * component ON PURPOSE — pairs must never render without it.
 */
export function ResultPairsGrid({ pairs }: { pairs: ResultPair[] }) {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pairs.map((pair) => (
          <figure key={pair.href ?? pair.after} className="flex flex-col overflow-hidden rounded-4xl bg-white ring-1 ring-line">
            <div className="relative">
              <CompareSlider
                before={pair.before}
                after={pair.after}
                alt={pair.label || "treatment documentation"}
              />
              {pair.sample ? <SampleBadge className="pointer-events-none absolute bottom-4 left-4" /> : null}
            </div>
            <figcaption className="flex flex-1 flex-col p-6">
              {pair.label ? (
                <p className="text-sm font-semibold text-teal-800">{pair.label}</p>
              ) : null}
              {pair.note ? (
                <p className="mt-1.5 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{pair.note}</p>
              ) : null}
              {pair.href ? (
                <Link
                  href={pair.href}
                  className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-olive-600 hover:text-olive-700"
                >
                  Read the case report
                  <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/results"
          className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-teal-800 ring-1 ring-line transition-colors hover:bg-teal-50"
        >
          See all patient results
          <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Non-negotiable disclaimer — do not remove. */}
      <ResultsDisclaimer className="mt-8" />
    </>
  );
}
