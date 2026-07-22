"use client";

import { Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

const FREE_SHIPPING_THRESHOLD = 99900; // ₹999 in paise
const SHIPPING_FEE = 6000; // ₹60 in paise

export function CartView() {
  const { items, subtotal, setQuantity, remove, clear, hydrated } = useCart();

  // Avoid a flash of "empty cart" before localStorage is read.
  if (!hydrated) {
    return <div className="h-96 animate-pulse rounded-5xl bg-platinum" />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-5xl bg-platinum py-24 text-center ring-1 ring-line">
        <span className="grid size-16 place-items-center rounded-3xl bg-white text-olive-600 shadow-soft">
          <ShoppingBag className="size-7" strokeWidth={1.5} aria-hidden />
        </span>
        <div>
          <h2 className="text-h3 text-teal-800">Your cart is empty</h2>
          <p className="mx-auto mt-2.5 max-w-sm text-muted">
            Have a look at the doctor-formulated range — most patients start
            with the complete kit.
          </p>
        </div>
        <Button href="/shop" size="lg">
          Browse products
        </Button>
      </div>
    );
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
      {/* ------------------------------- Items ------------------------------ */}
      <div>
        <ul className="flex flex-col divide-y divide-line">
          {items.map((item) => (
            <li key={item.slug} className="flex gap-5 py-6 first:pt-0">
              <Link href={`/shop/${item.slug}`} className="shrink-0">
                <PlaceholderImage
                  slot={`Product photo — ${item.name}`}
                  variant="product"
                  rounded="rounded-3xl"
                  className="size-28 sm:size-32"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/shop/${item.slug}`}
                      className="font-display text-xl text-teal-800 transition-colors hover:text-teal-600"
                    >
                      {item.name}
                    </Link>
                    {item.size ? (
                      <p className="mt-1 text-sm text-muted">{item.size}</p>
                    ) : null}
                  </div>

                  <p className="font-semibold text-teal-800">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                  <div className="flex items-center rounded-full ring-1 ring-line">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.slug, item.quantity - 1)}
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-teal-50 hover:text-teal-800"
                    >
                      <Minus className="size-3.5" strokeWidth={2} aria-hidden />
                    </button>
                    <span
                      aria-live="polite"
                      className="w-9 text-center text-sm font-semibold text-teal-800"
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.slug, item.quantity + 1)}
                      aria-label={`Increase quantity of ${item.name}`}
                      className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-teal-50 hover:text-teal-800"
                    >
                      <Plus className="size-3.5" strokeWidth={2} aria-hidden />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(item.slug)}
                    className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-red-600"
                  >
                    <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
          <Button href="/shop" variant="ghost">
            Continue shopping
          </Button>
          <button
            type="button"
            onClick={clear}
            className="text-sm text-muted transition-colors hover:text-red-600"
          >
            Clear cart
          </button>
        </div>
      </div>

      {/* ------------------------------ Summary ----------------------------- */}
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="rounded-5xl bg-card p-8 ring-1 ring-line">
          <h2 className="text-h3 text-teal-800">Order summary</h2>

          <dl className="mt-7 flex flex-col gap-4">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-medium text-teal-800">
                {formatPrice(subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="font-medium text-teal-800">
                {shipping === 0 ? (
                  <span className="text-olive-600">Free</span>
                ) : (
                  formatPrice(shipping)
                )}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-4">
              <dt className="font-semibold text-teal-800">Total</dt>
              <dd className="font-display text-2xl text-teal-800">
                {formatPrice(total)}
              </dd>
            </div>
          </dl>

          {remaining > 0 ? (
            <p className="mt-5 rounded-2xl bg-olive-50 px-4 py-3 text-sm text-olive-700">
              Add {formatPrice(remaining)} more for free shipping.
            </p>
          ) : null}

          <Button size="lg" className="mt-7 w-full" href="/book">
            Proceed to checkout
          </Button>

          <p className="mt-4 text-center text-xs leading-relaxed text-muted">
            This is a demonstration store. No payment is taken and no order is
            placed.
          </p>

          <div className="mt-7 flex gap-3 border-t border-line pt-6">
            <ShieldCheck
              className="mt-0.5 size-5 shrink-0 text-olive-600"
              strokeWidth={1.7}
              aria-hidden
            />
            <p className="text-sm leading-relaxed text-muted">
              Products are cosmetic preparations that support treatment. They are
              not medicines and are not sold as cures. Prescription items are
              dispensed only after consultation.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
