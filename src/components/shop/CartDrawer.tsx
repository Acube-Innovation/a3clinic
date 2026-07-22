"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Link } from "@/i18n/navigation";

export function CartDrawer() {
  const t = useTranslations("common");
  const { items, subtotal, isDrawerOpen, closeDrawer, setQuantity, remove } =
    useCart();
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  return (
    <AnimatePresence>
      {isDrawerOpen ? (
        <motion.div
          className="fixed inset-0 z-[70]"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            aria-label="Close cart"
            onClick={closeDrawer}
            className="absolute inset-0 bg-teal-950/50 backdrop-blur-sm"
          />

          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={t("cart")}
            initial={reduced ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduced ? undefined : { x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-lift outline-none"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="flex items-center gap-2.5 text-lg font-semibold text-teal-800">
                <ShoppingBag className="size-5 text-olive-600" strokeWidth={1.75} aria-hidden />
                {t("cart")}
              </h2>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close cart"
                className="grid size-10 place-items-center rounded-full text-teal-800 transition-colors hover:bg-teal-50"
              >
                <X className="size-5" strokeWidth={1.75} aria-hidden />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <span className="grid size-16 place-items-center rounded-3xl bg-teal-50 text-olive-600">
                  <ShoppingBag className="size-7" strokeWidth={1.5} aria-hidden />
                </span>
                <p className="text-muted">
                  Your cart is empty. Explore the doctor-formulated range.
                </p>
                <Button href="/shop" variant="secondary" onClick={closeDrawer}>
                  {t("shopProducts")}
                </Button>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
                  {items.map((item) => (
                    <li key={item.slug} className="flex gap-4 py-5">
                      <Link href={`/shop/${item.slug}`} onClick={closeDrawer}>
                        <PlaceholderImage
                          slot={`Product photo — ${item.name}`}
                          variant="product"
                          rounded="rounded-2xl"
                          className="size-20 shrink-0"
                        />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <Link
                          href={`/shop/${item.slug}`}
                          onClick={closeDrawer}
                          className="truncate font-medium text-teal-800 hover:text-teal-600"
                        >
                          {item.name}
                        </Link>
                        {item.size ? (
                          <span className="mt-0.5 text-sm text-muted">
                            {item.size}
                          </span>
                        ) : null}

                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center rounded-full ring-1 ring-line">
                            <button
                              type="button"
                              onClick={() =>
                                setQuantity(item.slug, item.quantity - 1)
                              }
                              aria-label={`Decrease quantity of ${item.name}`}
                              className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-teal-50 hover:text-teal-800"
                            >
                              <Minus className="size-3.5" strokeWidth={2} aria-hidden />
                            </button>
                            <span
                              aria-live="polite"
                              className="w-8 text-center text-sm font-semibold text-teal-800"
                            >
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setQuantity(item.slug, item.quantity + 1)
                              }
                              aria-label={`Increase quantity of ${item.name}`}
                              className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-teal-50 hover:text-teal-800"
                            >
                              <Plus className="size-3.5" strokeWidth={2} aria-hidden />
                            </button>
                          </div>

                          <span className="font-semibold text-teal-800">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(item.slug)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="self-start rounded-full p-2 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-line px-6 py-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-muted">Subtotal</span>
                    <span className="text-xl font-semibold text-teal-800">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-muted">
                    Shipping and taxes calculated at checkout.
                  </p>
                  <Button href="/cart" size="lg" className="mt-5 w-full" onClick={closeDrawer}>
                    View cart &amp; checkout
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
