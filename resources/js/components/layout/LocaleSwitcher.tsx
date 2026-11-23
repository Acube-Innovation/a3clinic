import { useLocale } from "@/i18n/intl";
import { useTransition } from "react";
import { Globe } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "@/i18n/navigation";
import { routing, localeLabels, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ tone = "light" }: { tone?: "light" | "dark" }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const [isPending, startTransition] = useTransition();

  function onChange(next: string) {
    startTransition(() => {
      // Same page (and query) in the other locale, e.g. /en/shop/x -> /ml/shop/x.
      router.replace(query ? `${pathname}?${query}` : pathname, { locale: next as Locale });
    });
  }

  return (
    <label
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors",
        tone === "light"
          ? "text-muted hover:text-teal-800"
          : "text-teal-100/80 hover:text-white",
        isPending && "opacity-60",
      )}
    >
      <Globe className="size-4" aria-hidden strokeWidth={1.75} />
      <span className="sr-only">Language</span>
      <select
        value={locale}
        onChange={(event) => onChange(event.target.value)}
        disabled={isPending}
        className="cursor-pointer appearance-none bg-transparent pr-1 font-medium outline-none"
      >
        {routing.locales.map((code) => (
          <option key={code} value={code} className="text-ink">
            {localeLabels[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
