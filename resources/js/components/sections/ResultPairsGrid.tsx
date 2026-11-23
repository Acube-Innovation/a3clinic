import { Info } from "lucide-react";

import { ProtectedImage } from "@/components/ui/ProtectedImage";
import type { ResultPair } from "@/data/conditions";

/**
 * Watermarked before/after pairs with the compliance disclaimer.
 * The disclaimer is part of this component ON PURPOSE — pairs must never
 * render without it. See README § Compliance.
 */
export function ResultPairsGrid({ pairs }: { pairs: ResultPair[] }) {
  return (
    <>
      <div className="flex flex-col gap-10">
        {pairs.map((pair) => (
          <div key={pair.after}>
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                { label: "Before", src: pair.before },
                { label: "After", src: pair.after },
              ].map((image) => (
                <figure key={image.label}>
                  <div className="relative overflow-hidden rounded-4xl">
                    <ProtectedImage
                      src={image.src}
                      alt={`${image.label} — ${pair.label || "treatment documentation"}`}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <figcaption className="absolute left-4 top-4 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-teal-800 backdrop-blur-sm">
                      {image.label}
                    </figcaption>
                  </div>
                </figure>
              ))}
            </div>

            {pair.label || pair.note ? (
              <div className="mt-4 px-1">
                {pair.label ? (
                  <p className="text-sm font-semibold text-teal-800">
                    {pair.label}
                  </p>
                ) : null}
                {pair.note ? (
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {pair.note}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Non-negotiable disclaimer — do not remove. */}
      <div className="mt-8 flex gap-3.5 rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6">
        <Info
          className="mt-0.5 size-5 shrink-0 text-olive-600"
          strokeWidth={1.75}
          aria-hidden
        />
        <p className="text-sm leading-relaxed text-muted">
          <span className="font-semibold text-teal-800">
            Results vary from person to person.
          </span>{" "}
          Photographs are illustrative of how the clinic documents treatment,
          and are published only with the written consent of the patient
          concerned. They are not a prediction or a guarantee of any individual
          outcome. Response depends on the underlying cause, how long the
          condition has been present, and factors outside the clinic&rsquo;s
          control. Some conditions are managed rather than resolved, and some do
          not respond.
        </p>
      </div>
    </>
  );
}
