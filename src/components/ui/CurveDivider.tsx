import { cn } from "@/lib/utils";

/**
 * Soft curved transitions between sections. `fill` should match the colour of
 * the section the curve is flowing INTO.
 */
export function CurveDivider({
  position = "bottom",
  fill = "fill-white",
  className,
  variant = "arc",
}: {
  position?: "top" | "bottom";
  fill?: string;
  className?: string;
  variant?: "arc" | "wave";
}) {
  const paths = {
    arc: "M0,64 C360,0 1080,0 1440,64 L1440,120 L0,120 Z",
    wave: "M0,48 C240,96 480,0 720,32 C960,64 1200,112 1440,72 L1440,120 L0,120 Z",
  };

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 z-10 leading-none",
        position === "bottom" ? "bottom-0" : "top-0 rotate-180",
        className,
      )}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className={cn("block h-12 w-full sm:h-20 lg:h-28", fill)}
      >
        <path d={paths[variant]} />
      </svg>
    </div>
  );
}

/** Decorative olive/teal blobs used behind hero and CTA sections. */
export function AmbientBlobs({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      <div
        className={cn(
          "blob-a absolute -left-32 top-[-10%] size-[38rem] opacity-60 blur-3xl",
          tone === "light"
            ? "bg-gradient-to-br from-teal-50 to-olive-50"
            : "bg-gradient-to-br from-teal-700/40 to-olive-700/20",
        )}
      />
      <div
        className={cn(
          "blob-b absolute -right-40 bottom-[-15%] size-[32rem] opacity-50 blur-3xl",
          tone === "light"
            ? "bg-gradient-to-tr from-olive-50 to-teal-50"
            : "bg-gradient-to-tr from-olive-700/25 to-teal-700/30",
        )}
      />
    </div>
  );
}
