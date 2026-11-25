import { FlaskConical } from "lucide-react";

import { cn } from "@/lib/utils";

/** Marks placeholder cases so they can never be read as a real patient. */
export function SampleBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200",
        className,
      )}
    >
      <FlaskConical className="size-3.5" strokeWidth={2} aria-hidden />
      Illustrative example
    </span>
  );
}
