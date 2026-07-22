"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePathname } from "@/i18n/navigation";
import { PackageOpen } from "lucide-react";

import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";
import {
  categoryLabels,
  type Product,
  type ProductCategory,
} from "@/data/product-types";

/**
 * Category filtering happens on the client so /shop stays statically
 * prerendered while still honouring ?category= links from the footer.
 *
 * Must be rendered inside <Suspense> — useSearchParams opts a static page into
 * client-side rendering for this subtree only.
 */
export function ShopBrowser({
  products,
  categories,
}: {
  products: Product[];
  categories: ProductCategory[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const active = searchParams.get("category");

  const filtered = useMemo(() => {
    if (!active) return products;
    return products.filter((product) => product.category === active);
  }, [products, active]);

  function select(category: ProductCategory | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    const query = params.toString();
    // scroll: false keeps the user's position on the filter bar.
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => select(null)}
          aria-pressed={!active}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200",
            !active
              ? "bg-teal-800 text-white"
              : "bg-platinum text-muted ring-1 ring-line hover:text-teal-800",
          )}
        >
          All products
        </button>

        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => select(category)}
            aria-pressed={active === category}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200",
              active === category
                ? "bg-teal-800 text-white"
                : "bg-platinum text-muted ring-1 ring-line hover:text-teal-800",
            )}
          >
            {categoryLabels[category]}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        Showing {filtered.length}{" "}
        {filtered.length === 1 ? "product" : "products"}
        {active ? ` in ${categoryLabels[active as ProductCategory]}` : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-5xl bg-platinum py-20 text-center ring-1 ring-line">
          <span className="grid size-14 place-items-center rounded-2xl bg-white text-olive-600">
            <PackageOpen className="size-6" strokeWidth={1.6} aria-hidden />
          </span>
          <p className="text-muted">Nothing in this category just yet.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
