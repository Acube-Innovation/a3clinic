import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type Crumb = { name: string; href: string };

/**
 * Visual breadcrumbs. The matching BreadcrumbList JSON-LD is emitted separately
 * by each page via `breadcrumbSchema()` so the markup stays clean.
 */
export async function Breadcrumbs({
  crumbs,
  tone = "light",
  className,
}: {
  crumbs: Crumb[];
  tone?: "light" | "dark";
  className?: string;
}) {
  const t = await getTranslations("common");

  return (
    <nav aria-label={t("breadcrumb")} className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        <li>
          <Link
            href="/"
            className={cn(
              "transition-colors",
              tone === "light"
                ? "text-muted hover:text-teal-800"
                : "text-teal-100/60 hover:text-white",
            )}
          >
            {t("home")}
          </Link>
        </li>

        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-1.5">
              <ChevronRight
                aria-hidden
                strokeWidth={2}
                className={cn(
                  "size-3.5",
                  tone === "light" ? "text-line" : "text-white/25",
                )}
              />
              {isLast ? (
                <span
                  aria-current="page"
                  className={cn(
                    "font-medium",
                    tone === "light" ? "text-teal-800" : "text-white",
                  )}
                >
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className={cn(
                    "transition-colors",
                    tone === "light"
                      ? "text-muted hover:text-teal-800"
                      : "text-teal-100/60 hover:text-white",
                  )}
                >
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
