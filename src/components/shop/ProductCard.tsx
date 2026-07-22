"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Heart, Plus, Star } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-context";
import { formatPrice, cn } from "@/lib/utils";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Badge } from "@/components/ui/Card";
import type { Product } from "@/data/product-types";

export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations("common");
  const { add, toggleWishlist, isWishlisted, hydrated } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const wishlisted = hydrated && isWishlisted(product.slug);

  function onAdd(event: React.MouseEvent) {
    event.preventDefault();
    add(
      {
        slug: product.slug,
        name: product.name,
        price: product.price,
        size: product.size,
      },
      1,
    );
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-4xl bg-card ring-1 ring-line transition-[transform,box-shadow,ring-color] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-lift hover:ring-teal-100">
      <div className="relative">
        <Link href={`/shop/${product.slug}`} className="block overflow-hidden">
          {product.image ? (
            // Admin upload served from our /uploads route.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
            />
          ) : (
            <PlaceholderImage
              slot={`Product photography — ${product.name}, ${product.size}, on a light neutral background`}
              variant="product"
              rounded="rounded-none"
              className="aspect-[4/3] w-full transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
            />
          )}
        </Link>

        {/* Badges */}
        <div className="pointer-events-none absolute left-4 top-4 flex flex-col items-start gap-2">
          {product.bestseller ? <Badge tone="teal">Bestseller</Badge> : null}
          {product.compareAtPrice ? (
            <Badge tone="olive">
              Save {formatPrice(product.compareAtPrice - product.price)}
            </Badge>
          ) : null}
          {!product.inStock ? (
            <Badge tone="neutral">{t("outOfStock")}</Badge>
          ) : null}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.slug)}
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={wishlisted}
          className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/90 text-muted shadow-soft backdrop-blur-sm transition-colors duration-300 hover:text-red-500"
        >
          <Heart
            className={cn("size-4.5", wishlisted && "fill-red-500 text-red-500")}
            strokeWidth={1.75}
            aria-hidden
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-1.5">
          <Star className="size-3.5 fill-olive-500 text-olive-500" aria-hidden />
          <span className="text-xs font-semibold text-teal-800">
            {product.rating.value.toFixed(1)}
          </span>
          <span className="text-xs text-muted">
            ({product.rating.count} reviews)
          </span>
        </div>

        <h3 className="mt-2.5 font-display text-xl text-teal-800">
          <Link href={`/shop/${product.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {product.name}
          </Link>
        </h3>

        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
          {product.tagline}
        </p>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <span className="text-lg font-semibold text-teal-800">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice ? (
              <span className="ml-2 text-sm text-muted line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            ) : null}
            <span className="mt-0.5 block text-xs text-muted">
              {product.size}
            </span>
          </div>

          {/* Sits above the card-wide link via z-index. */}
          <button
            type="button"
            onClick={onAdd}
            disabled={!product.inStock}
            aria-label={`${t("addToCart")}: ${product.name}`}
            className={cn(
              "relative z-10 grid size-11 shrink-0 place-items-center rounded-full transition-all duration-300",
              product.inStock
                ? "bg-teal-800 text-white hover:bg-teal-700 hover:shadow-lift"
                : "cursor-not-allowed bg-platinum text-muted",
              justAdded && "bg-olive-500 hover:bg-olive-500",
            )}
          >
            {justAdded ? (
              <Check className="size-5" strokeWidth={2.5} aria-hidden />
            ) : (
              <Plus className="size-5" strokeWidth={2} aria-hidden />
            )}
          </button>
        </div>

        <span aria-live="polite" className="sr-only">
          {justAdded ? `${product.name} ${t("addedToCart")}` : ""}
        </span>
      </div>
    </article>
  );
}
