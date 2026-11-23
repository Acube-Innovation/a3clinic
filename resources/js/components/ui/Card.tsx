import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  hover = true,
  tone = "light",
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={cn(
        "relative rounded-4xl p-7 sm:p-8",
        tone === "light"
          ? "bg-card ring-1 ring-line"
          : "bg-white/5 ring-1 ring-white/10 backdrop-blur-sm",
        hover &&
          "transition-[transform,box-shadow,ring-color] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1 " +
            (tone === "light"
              ? "hover:shadow-lift hover:ring-teal-100"
              : "hover:bg-white/10 hover:ring-white/20"),
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "olive",
  className,
}: {
  children: React.ReactNode;
  tone?: "olive" | "teal" | "neutral" | "onDark";
  className?: string;
}) {
  const tones = {
    olive: "bg-olive-50 text-olive-700 ring-olive-200",
    teal: "bg-teal-50 text-teal-700 ring-teal-200",
    neutral: "bg-platinum text-muted ring-line",
    onDark: "bg-white/10 text-white ring-white/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Icon in a soft tinted tile — the recurring motif for feature lists.
 * Olive appears only as the icon stroke, never as the tile fill.
 */
export function IconTile({
  children,
  tone = "light",
  className,
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-13 shrink-0 items-center justify-center rounded-2xl",
        tone === "light"
          ? "bg-teal-50 text-olive-600 ring-1 ring-teal-100"
          : "bg-white/10 text-olive-300 ring-1 ring-white/15",
        className,
      )}
    >
      {children}
    </span>
  );
}
