import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Wordmark + monogram. The mark is a stylised leaf/drop in olive inside a teal
 * ring — nature + clinical, without resorting to a stethoscope cliché.
 */
export function Logo({
  tone = "light",
  className,
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-3", className)}
      aria-label="Dr. Riji's Health Care — home"
    >
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-2xl ring-1 transition-colors duration-300",
          tone === "light"
            ? "bg-teal-800 ring-teal-800/10 group-hover:bg-teal-700"
            : "bg-white/10 ring-white/20 group-hover:bg-white/15",
        )}
      >
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden fill="none">
          <path
            d="M12 3.5c4.2 2.1 6.5 5.2 6.5 8.6a6.5 6.5 0 1 1-13 0c0-3.4 2.3-6.5 6.5-8.6Z"
            stroke="#9DB955"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M12 20V9.5M12 13.2l3-2.6M12 15.8l-2.6-2.2"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>

      <span className="flex flex-col leading-none whitespace-nowrap">
        <span
          className={cn(
            "font-display text-[1.0625rem] font-semibold tracking-tight",
            tone === "light" ? "text-teal-800" : "text-white",
          )}
        >
          Dr. Riji&rsquo;s
        </span>
        <span
          className={cn(
            "mt-1 text-[0.6875rem] font-medium uppercase tracking-[0.16em]",
            tone === "light" ? "text-muted" : "text-teal-100/70",
          )}
        >
          Health Care
        </span>
      </span>
    </Link>
  );
}
