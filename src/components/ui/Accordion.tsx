"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionItem = {
  question: string;
  answer: string;
};

export function Accordion({
  items,
  className,
  tone = "light",
}: {
  items: AccordionItem[];
  className?: string;
  tone?: "light" | "dark";
}) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();
  const reduced = useReducedMotion();

  return (
    <div className={cn("divide-y", tone === "light" ? "divide-line" : "divide-white/10", className)}>
      {items.map((item, index) => {
        const isOpen = open === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <div key={item.question}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : index)}
                className={cn(
                  "flex w-full items-start justify-between gap-6 py-6 text-left transition-colors duration-200",
                  tone === "light"
                    ? "text-teal-800 hover:text-teal-600"
                    : "text-white hover:text-olive-200",
                )}
              >
                <span className="text-lg font-medium leading-snug sm:text-xl">
                  {item.question}
                </span>
                <span
                  className={cn(
                    "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full transition-transform duration-300 ease-[var(--ease-out-soft)]",
                    isOpen && "rotate-45",
                    tone === "light"
                      ? "bg-teal-50 text-olive-600"
                      : "bg-white/10 text-olive-300",
                  )}
                >
                  <Plus className="size-4" aria-hidden strokeWidth={2} />
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduced ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p
                    className={cn(
                      "max-w-3xl pb-7 pr-12 leading-relaxed",
                      tone === "light" ? "text-muted" : "text-teal-100/75",
                    )}
                  >
                    {item.answer}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
