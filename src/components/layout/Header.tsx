"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Menu, Phone, ShoppingBag } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { mainNav } from "@/lib/site";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileNav } from "./MobileNav";
import { CartDrawer } from "@/components/shop/CartDrawer";

export type NavItem = { label: string; href: string };

export type PhoneInfo = { intl: string; display: string };

export function Header({
  treatments,
  phone,
  whatsappHref,
}: {
  treatments: NavItem[];
  phone: PhoneInfo;
  whatsappHref: string;
}) {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const { count, openDrawer, hydrated } = useCart();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close both menus whenever the route changes. Adjusting state during render
  // (rather than in an effect) avoids a frame where the menu is still open over
  // the new page — this is React's documented "adjust state on prop change".
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpenMenu(null);
    setMobileOpen(false);
  }

  const dark = scrolled;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ease-[var(--ease-out-soft)]",
          dark ? "glass-dark shadow-glass" : "bg-white/80 backdrop-blur-sm",
        )}
        onMouseLeave={() => setOpenMenu(null)}
      >
        <div className="container-page">
          <div
            className={cn(
              "flex items-center justify-between gap-6 transition-[height] duration-500",
              dark ? "h-18" : "h-22",
            )}
          >
            <Logo tone={dark ? "dark" : "light"} />

            {/* ---------- Desktop navigation ---------- */}
            <nav
              aria-label="Main"
              className="hidden items-center gap-1 lg:flex"
            >
              {mainNav.map((item) => {
                const active =
                  pathname === item.href ||
                  ("children" in item &&
                    item.children?.some((c) => pathname === c.href));

                if ("children" in item && item.children) {
                  const isOpen = openMenu === item.key;
                  // "treatments" is the only nav group, and its entries come
                  // from the content store via the layout.
                  const entries: NavItem[] = treatments;
                  return (
                    <div
                      key={item.key}
                      className="relative"
                      onMouseEnter={() => setOpenMenu(item.key)}
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-haspopup="true"
                        onClick={() => setOpenMenu(isOpen ? null : item.key)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[0.9375rem] font-medium transition-colors duration-200",
                          dark
                            ? "text-teal-50/85 hover:bg-white/10 hover:text-white"
                            : "text-ink/80 hover:bg-teal-50 hover:text-teal-800",
                          active && (dark ? "text-white" : "text-teal-800"),
                        )}
                      >
                        {t(item.key)}
                        <ChevronDown
                          aria-hidden
                          strokeWidth={2}
                          className={cn(
                            "size-3.5 transition-transform duration-300",
                            isOpen && "rotate-180",
                          )}
                        />
                      </button>

                      {isOpen ? (
                        <div className="absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3">
                          <div className="max-h-[70svh] overflow-y-auto rounded-3xl bg-white p-2 shadow-lift ring-1 ring-line">
                            {entries.map((entry) => (
                              <Link
                                key={entry.href}
                                href={entry.href}
                                className="flex items-center justify-between rounded-2xl px-4 py-3 text-[0.9375rem] text-ink/80 transition-colors duration-200 hover:bg-teal-50 hover:text-teal-800"
                              >
                                {entry.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      "rounded-full px-4 py-2.5 text-[0.9375rem] font-medium transition-colors duration-200",
                      dark
                        ? "text-teal-50/85 hover:bg-white/10 hover:text-white"
                        : "text-ink/80 hover:bg-teal-50 hover:text-teal-800",
                      active && (dark ? "text-white" : "text-teal-800"),
                    )}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}
            </nav>

            {/* ---------- Actions ---------- */}
            <div className="flex items-center gap-1.5">
              <div className="hidden xl:block">
                <LocaleSwitcher tone={dark ? "dark" : "light"} />
              </div>

              <a
                href={`tel:${phone.intl}`}
                aria-label={`${tc("callNow")} ${phone.display}`}
                className={cn(
                  "hidden size-11 place-items-center rounded-full transition-colors duration-200 sm:grid",
                  dark
                    ? "text-teal-50/85 hover:bg-white/10 hover:text-white"
                    : "text-ink/70 hover:bg-teal-50 hover:text-teal-800",
                )}
              >
                <Phone className="size-5" strokeWidth={1.75} aria-hidden />
              </a>

              <button
                type="button"
                onClick={openDrawer}
                aria-label={`${tc("cart")}${hydrated && count > 0 ? ` (${count})` : ""}`}
                className={cn(
                  "relative grid size-11 place-items-center rounded-full transition-colors duration-200",
                  dark
                    ? "text-teal-50/85 hover:bg-white/10 hover:text-white"
                    : "text-ink/70 hover:bg-teal-50 hover:text-teal-800",
                )}
              >
                <ShoppingBag className="size-5" strokeWidth={1.75} aria-hidden />
                {hydrated && count > 0 ? (
                  <span className="absolute right-1 top-1 grid min-w-4.5 place-items-center rounded-full bg-olive-500 px-1 text-[0.625rem] font-bold leading-4.5 text-white">
                    {count}
                  </span>
                ) : null}
              </button>

              <Button
                href="/book"
                size="sm"
                variant={dark ? "onDark" : "primary"}
                // `max-md:hidden` rather than `hidden md:inline-flex`: the
                // Button's base class already sets `inline-flex`, and two
                // unprefixed display utilities resolve by stylesheet order
                // rather than by the order written here.
                className="ml-1.5 max-md:hidden"
              >
                {tc("bookConsultation")}
              </Button>

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label={t("openMenu")}
                className={cn(
                  "grid size-11 place-items-center rounded-full transition-colors duration-200 lg:hidden",
                  dark
                    ? "text-white hover:bg-white/10"
                    : "text-teal-800 hover:bg-teal-50",
                )}
              >
                <Menu className="size-6" strokeWidth={1.75} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        treatments={treatments}
        phone={phone}
        whatsappHref={whatsappHref}
      />
      <CartDrawer />
    </>
  );
}
