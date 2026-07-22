/**
 * Minimal class joiner. We deliberately avoid clsx/tailwind-merge as runtime
 * deps — component APIs below are written so classes never conflict, and the
 * `className` prop is always appended last so callers can override.
 */
export function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatPrice(paise: number) {
  return inr.format(paise / 100);
}

export function formatDate(iso: string, locale = "en-IN") {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
