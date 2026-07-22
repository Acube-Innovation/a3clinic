"use client";

import { useState } from "react";
import { Check, Heart, Minus, Plus, ShieldAlert, ShoppingBag, Star } from "lucide-react";

import { useCart } from "@/lib/cart-context";
import { formatPrice, cn, formatDate } from "@/lib/utils";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Badge } from "@/components/ui/Card";
import type { Product } from "@/data/product-types";

const tabs = ["Benefits", "Ingredients", "Directions", "Reviews"] as const;
type Tab = (typeof tabs)[number];

export function ProductDetail({ product }: { product: Product }) {
  const { add, toggleWishlist, isWishlisted, hydrated } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState<Tab>("Benefits");
  const [justAdded, setJustAdded] = useState(false);

  const wishlisted = hydrated && isWishlisted(product.slug);

  // Four angles of the same product until real photography is supplied.
  const views = [
    "front of pack",
    "back of pack with ingredient list",
    "texture / in-use shot",
    "lifestyle shot on a bathroom shelf",
  ];

  function onAdd() {
    add(
      {
        slug: product.slug,
        name: product.name,
        price: product.price,
        size: product.size,
      },
      quantity,
    );
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
      {/* ------------------------------ Gallery ----------------------------- */}
      <div className="lg:sticky lg:top-32 lg:self-start">
        {product.image && activeImage === 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="aspect-square w-full rounded-5xl object-cover ring-1 ring-line"
          />
        ) : (
          <PlaceholderImage
            slot={`Product photography — ${product.name}, ${views[activeImage]}`}
            variant="product"
            rounded="rounded-5xl"
            className="aspect-square w-full"
          />
        )}

        <div className="mt-4 grid grid-cols-4 gap-3">
          {views.map((view, index) => (
            <button
              key={view}
              type="button"
              onClick={() => setActiveImage(index)}
              aria-label={`View ${view}`}
              aria-pressed={activeImage === index}
              className={cn(
                "overflow-hidden rounded-2xl ring-1 transition-all duration-300",
                activeImage === index
                  ? "ring-2 ring-teal-600"
                  : "ring-line hover:ring-teal-200",
              )}
            >
              {product.image && index === 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <PlaceholderImage
                  slot={`${product.name} — ${view}`}
                  variant="product"
                  rounded="rounded-none"
                  className="aspect-square w-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------ Details ----------------------------- */}
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          {product.bestseller ? <Badge tone="teal">Bestseller</Badge> : null}
          {product.compareAtPrice ? (
            <Badge tone="olive">
              Save {formatPrice(product.compareAtPrice - product.price)}
            </Badge>
          ) : null}
          {!product.inStock ? <Badge tone="neutral">Out of stock</Badge> : null}
        </div>

        <h1 className="mt-5 text-h1 text-teal-800">{product.name}</h1>
        <p className="mt-3 text-lead text-muted">{product.tagline}</p>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                aria-hidden
                className={cn(
                  "size-4",
                  index < Math.round(product.rating.value)
                    ? "fill-olive-500 text-olive-500"
                    : "text-line",
                )}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-teal-800">
            {product.rating.value.toFixed(1)}
          </span>
          <button
            type="button"
            onClick={() => setTab("Reviews")}
            className="text-sm text-muted underline-offset-4 hover:text-teal-800 hover:underline"
          >
            {product.rating.count} reviews
          </button>
        </div>

        <div className="mt-8 flex items-baseline gap-3">
          <span className="font-display text-4xl text-teal-800">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice ? (
            <span className="text-lg text-muted line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
          <span className="text-sm text-muted">/ {product.size}</span>
        </div>

        <p className="mt-7 leading-relaxed text-muted">{product.description}</p>

        {/* ---------------------------- Purchase ---------------------------- */}
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-full ring-1 ring-line">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="grid size-12 place-items-center rounded-full text-muted transition-colors hover:bg-teal-50 hover:text-teal-800 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Minus className="size-4" strokeWidth={2} aria-hidden />
            </button>
            <span
              aria-live="polite"
              aria-label={`Quantity: ${quantity}`}
              className="w-10 text-center font-semibold text-teal-800"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(99, q + 1))}
              aria-label="Increase quantity"
              className="grid size-12 place-items-center rounded-full text-muted transition-colors hover:bg-teal-50 hover:text-teal-800"
            >
              <Plus className="size-4" strokeWidth={2} aria-hidden />
            </button>
          </div>

          <button
            type="button"
            onClick={onAdd}
            disabled={!product.inStock}
            className={cn(
              "group inline-flex h-12 flex-1 items-center justify-center gap-2.5 rounded-full px-7 font-semibold transition-all duration-300",
              product.inStock
                ? "bg-teal-800 text-white hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-lift"
                : "cursor-not-allowed bg-platinum text-muted",
              justAdded && "bg-olive-500 hover:bg-olive-500",
            )}
          >
            {justAdded ? (
              <>
                <Check className="size-4.5" strokeWidth={2.5} aria-hidden />
                Added to cart
              </>
            ) : (
              <>
                <ShoppingBag className="size-4.5" strokeWidth={1.9} aria-hidden />
                {product.inStock ? "Add to cart" : "Out of stock"}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => toggleWishlist(product.slug)}
            aria-label={
              wishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
            aria-pressed={wishlisted}
            className="grid size-12 place-items-center rounded-full text-muted ring-1 ring-line transition-colors hover:text-red-500"
          >
            <Heart
              className={cn("size-5", wishlisted && "fill-red-500 text-red-500")}
              strokeWidth={1.75}
              aria-hidden
            />
          </button>
        </div>

        {/* ------------------------------ Tabs ------------------------------ */}
        <div className="mt-14">
          <div role="tablist" aria-label="Product information" className="flex flex-wrap gap-2 border-b border-line">
            {tabs.map((name) => (
              <button
                key={name}
                role="tab"
                type="button"
                id={`tab-${name}`}
                aria-selected={tab === name}
                aria-controls={`panel-${name}`}
                onClick={() => setTab(name)}
                className={cn(
                  "-mb-px border-b-2 px-4 py-3 text-[0.9375rem] font-semibold transition-colors duration-200",
                  tab === name
                    ? "border-olive-500 text-teal-800"
                    : "border-transparent text-muted hover:text-teal-800",
                )}
              >
                {name}
              </button>
            ))}
          </div>

          <div
            role="tabpanel"
            id={`panel-${tab}`}
            aria-labelledby={`tab-${tab}`}
            className="pt-8"
          >
            {tab === "Benefits" ? (
              <ul className="flex flex-col gap-4">
                {product.benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3.5">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-olive-100 text-olive-700">
                      <Check className="size-3" strokeWidth={3} aria-hidden />
                    </span>
                    <span className="leading-relaxed text-muted">{benefit}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {tab === "Ingredients" ? (
              <dl className="flex flex-col divide-y divide-line">
                {product.ingredients.map((ingredient) => (
                  <div
                    key={ingredient.name}
                    className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6"
                  >
                    <dt className="font-medium text-teal-800">
                      {ingredient.name}
                    </dt>
                    <dd className="leading-relaxed text-muted">
                      {ingredient.role}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {tab === "Directions" ? (
              <ol className="flex flex-col gap-4">
                {product.directions.map((direction, index) => (
                  <li key={direction} className="flex gap-4">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-teal-50 text-sm font-semibold text-teal-800">
                      {index + 1}
                    </span>
                    <span className="self-center leading-relaxed text-muted">
                      {direction}
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}

            {tab === "Reviews" ? (
              <ul className="flex flex-col gap-6">
                {product.reviews.map((review) => (
                  <li
                    key={`${review.author}-${review.date}`}
                    className="rounded-4xl bg-card p-6 ring-1 ring-line"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            aria-hidden
                            className={cn(
                              "size-3.5",
                              index < review.rating
                                ? "fill-olive-500 text-olive-500"
                                : "text-line",
                            )}
                          />
                        ))}
                        <span className="sr-only">
                          {review.rating} out of 5 stars
                        </span>
                      </div>
                      <time
                        dateTime={review.date}
                        className="text-sm text-muted"
                      >
                        {formatDate(review.date)}
                      </time>
                    </div>

                    <h3 className="mt-3 font-semibold text-teal-800">
                      {review.title}
                    </h3>
                    <p className="mt-2 leading-relaxed text-muted">
                      {review.body}
                    </p>
                    <p className="mt-4 text-sm font-medium text-teal-800">
                      {review.author}
                      <span className="ml-2 font-normal text-muted">
                        {review.location}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {/* ----------------------------- Caution ---------------------------- */}
        <div className="mt-12 flex gap-4 rounded-4xl bg-platinum p-6 ring-1 ring-line sm:p-7">
          <ShieldAlert
            className="mt-0.5 size-5 shrink-0 text-olive-600"
            strokeWidth={1.75}
            aria-hidden
          />
          <div>
            <h2 className="font-semibold text-teal-800">Safety information</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {product.caution}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
