import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The non-negotiable "results vary" notice. Every place that shows patient
 * photographs renders this — see README § Compliance. Do not remove.
 */
export function ResultsDisclaimer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex gap-3.5 rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6",
        className,
      )}
    >
      <Info
        className="mt-0.5 size-5 shrink-0 text-olive-600"
        strokeWidth={1.75}
        aria-hidden
      />
      <p className="text-sm leading-relaxed text-muted">
        <span className="font-semibold text-teal-800">
          Results vary from person to person.
        </span>{" "}
        Photographs are illustrative of how the clinic documents treatment, and
        are published only with the written consent of the patient concerned.
        They are not a prediction or a guarantee of any individual outcome.
        Response depends on the underlying cause, how long the condition has
        been present, and factors outside the clinic&rsquo;s control. Some
        conditions are managed rather than resolved, and some do not respond.
      </p>
    </div>
  );
}
