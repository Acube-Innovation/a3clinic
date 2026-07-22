"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp } from "lucide-react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
/**
 * Persistent WhatsApp entry point plus a back-to-top control. On mobile these
 * sit above the safe area so they never collide with browser chrome.
 */
export function FloatingActions({ whatsappHref }: { whatsappHref: string }) {
  const [showTop, setShowTop] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 900);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 pb-[env(safe-area-inset-bottom)] print:hidden">
      <AnimatePresence>
        {showTop ? (
          <motion.button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: reduced ? "auto" : "smooth",
              })
            }
            aria-label="Back to top"
            initial={reduced ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="grid size-11 place-items-center rounded-full bg-white text-teal-800 shadow-card ring-1 ring-line transition-colors hover:bg-teal-50"
          >
            <ArrowUp className="size-5" strokeWidth={2} aria-hidden />
          </motion.button>
        ) : null}
      </AnimatePresence>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with the clinic on WhatsApp"
        className="group flex h-14 items-center gap-3 rounded-full bg-teal-800 pl-4 pr-5 text-white shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-700"
      >
        <SiWhatsapp size={22} aria-hidden className="text-olive-300" />
        <span className="hidden text-sm font-semibold sm:inline">
          Chat with us
        </span>
      </a>
    </div>
  );
}
