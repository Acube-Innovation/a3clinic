"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { ChevronDown, MessageCircle, Phone, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { mainNav } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { LocaleSwitcher } from "./LocaleSwitcher";

import type { NavItem, PhoneInfo } from "./Header";

export function MobileNav({
  open,
  onClose,
  treatments,
  phone,
  whatsappHref,
}: {
  open: boolean;
  onClose: () => void;
  treatments: NavItem[];
  phone: PhoneInfo;
  whatsappHref: string;
}) {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<string | null>("treatments");

  // Lock scroll and close on Escape while the drawer is open.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    // Move focus into the panel so keyboard users are not left behind it.
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] lg:hidden"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            aria-label={t("closeMenu")}
            onClick={onClose}
            className="absolute inset-0 bg-teal-950/50 backdrop-blur-sm"
          />

          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={t("menu")}
            initial={reduced ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduced ? undefined : { x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-lift outline-none"
          >
            <div className="flex h-22 items-center justify-between border-b border-line px-6">
              <LocaleSwitcher />
              <button
                type="button"
                onClick={onClose}
                aria-label={t("closeMenu")}
                className="grid size-11 place-items-center rounded-full text-teal-800 transition-colors hover:bg-teal-50"
              >
                <X className="size-6" strokeWidth={1.75} aria-hidden />
              </button>
            </div>

            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-6">
              <ul className="flex flex-col gap-1">
                {mainNav.map((item) => {
                  const hasChildren = "children" in item && item.children;
                  const isExpanded = expanded === item.key;
                  // "treatments" is the only nav group, and its entries come
                  // from the content store via the layout.
                  const entries: NavItem[] = hasChildren ? treatments : [];

                  return (
                    <li key={item.key}>
                      {hasChildren ? (
                        <>
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            onClick={() =>
                              setExpanded(isExpanded ? null : item.key)
                            }
                            className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-lg font-medium text-teal-800 transition-colors hover:bg-teal-50"
                          >
                            {t(item.key)}
                            <ChevronDown
                              aria-hidden
                              strokeWidth={2}
                              className={cn(
                                "size-4 text-muted transition-transform duration-300",
                                isExpanded && "rotate-180",
                              )}
                            />
                          </button>

                          <AnimatePresence initial={false}>
                            {isExpanded ? (
                              <motion.ul
                                initial={reduced ? false : { height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={reduced ? undefined : { height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                className="overflow-hidden pl-4"
                              >
                                {entries.map((entry) => (
                                  <li key={entry.href}>
                                    <Link
                                      href={entry.href}
                                      onClick={onClose}
                                      className="block rounded-xl px-4 py-2.5 text-[0.9375rem] text-muted transition-colors hover:bg-teal-50 hover:text-teal-800"
                                    >
                                      {entry.label}
                                    </Link>
                                  </li>
                                ))}
                              </motion.ul>
                            ) : null}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className="block rounded-2xl px-4 py-3.5 text-lg font-medium text-teal-800 transition-colors hover:bg-teal-50"
                        >
                          {t(item.key)}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t border-line p-6">
              <Button href="/book" size="lg" className="w-full">
                {tc("bookConsultation")}
              </Button>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <a
                  href={`tel:${phone.intl}`}
                  className="flex items-center justify-center gap-2 rounded-full bg-platinum px-4 py-3 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-50"
                >
                  <Phone className="size-4" strokeWidth={1.75} aria-hidden />
                  {tc("callNow")}
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full bg-platinum px-4 py-3 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-50"
                >
                  <MessageCircle className="size-4" strokeWidth={1.75} aria-hidden />
                  {tc("whatsapp")}
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
