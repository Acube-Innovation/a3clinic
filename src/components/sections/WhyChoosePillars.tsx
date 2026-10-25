"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import {
  ClipboardList,
  FlaskConical,
  HeartHandshake,
  MonitorSmartphone,
  Stethoscope,
  TimerReset,
} from "lucide-react";

import { cn } from "@/lib/utils";

/** How long each pillar stays on screen before the showcase advances. */
const INTERVAL_MS = 6500;

const pillars = [
  {
    Icon: ClipboardList,
    title: "The history comes first",
    detail:
      "A first consultation runs about forty-five minutes. Medical history, family history, diet, sleep and stress are covered before the scalp is examined — because that is usually where the answer is.",
    image: "/images/consultation-history.jpg",
    alt: "Dr. Riji Rasheed taking a patient's history during a consultation",
    position: "object-[48%_center]",
    stat: { value: "~45 min", label: "First consultation" },
    points: ["Medical history", "Family history", "Diet & sleep", "Stress"],
  },
  {
    Icon: FlaskConical,
    title: "Investigate, then prescribe",
    detail:
      "Where your history points to thyroid, iron or hormonal involvement, testing comes before treatment. Treating the scalp alone rarely holds when the cause sits elsewhere.",
    image: "/images/trichoscopy-examination.jpg",
    alt: "Scalp examined with a digital trichoscope, magnified hair shown on screen",
    position: "object-[57%_center]",
    stat: { value: "Cause first", label: "Testing before treatment" },
    points: ["Thyroid", "Iron", "Hormones"],
  },
  {
    Icon: Stethoscope,
    title: "Individualised prescribing",
    detail:
      "Two patients with the same complaint often receive different prescriptions. Treatment is selected for your constitution and cause, never from a fixed protocol.",
    image: "/images/individual-prescription.jpg",
    alt: "Doctor explaining a prescribed set of medicines to a patient across the consulting desk",
    position: "object-[center_30%]",
    stat: { value: "1 : 1", label: "Prescription per patient" },
    points: ["Your constitution", "Your cause", "No fixed protocol"],
  },
  {
    Icon: MonitorSmartphone,
    title: "Online or in clinic",
    detail:
      "The same consultation, the same follow-up schedule, whether you attend in Kattakkada or join by video from anywhere. Medicines are couriered to your door.",
    image: "/images/hero-clinic.jpg",
    alt: "Reception of Dr. Riji's Health Care in Kattakkada",
    position: "object-center",
    stat: { value: "Clinic or video", label: "Same care either way" },
    points: ["Kattakkada clinic", "Video consultation", "Courier delivery"],
  },
  {
    Icon: TimerReset,
    title: "Structured follow-up",
    detail:
      "Reviews every four to six weeks with comparison photographs, because gradual change is genuinely hard to judge from memory alone.",
    image: "/uploads/67cd7ee5-3839-4799-943a-915e39bbcbf2.jpg",
    alt: "Close-up of a thinning crown photographed for comparison",
    position: "object-center",
    stat: { value: "4–6 weeks", label: "Between reviews" },
    points: ["Comparison photographs", "Prescription adjusted"],
  },
  {
    Icon: HeartHandshake,
    title: "Honest about limits",
    detail:
      "You will be told at the first consultation what is realistically achievable in your case — including when the answer is limited. No guaranteed outcomes, no fixed-result packages.",
    image: "/images/doctor-portrait.jpg",
    alt: "Dr. Riji Rasheed at her consulting desk",
    position: "object-top",
    stat: { value: "Day one", label: "Realistic expectations" },
    points: ["No guaranteed outcomes", "No fixed-result packages"],
  },
];

/**
 * Interactive "why choose" showcase: a list of pillars on one side, a photo
 * stage with an overlaid summary card on the other. Auto-advances in an
 * endless loop; clicking a pillar jumps there and the loop carries on.
 */
export function WhyChoosePillars() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setTimeout(
      () => setActive((i) => (i + 1) % pillars.length),
      INTERVAL_MS,
    );
    return () => clearTimeout(id);
  }, [active]);

  const current = pillars[active];

  return (
    <div className="mt-16 grid gap-8 lg:grid-cols-12 lg:gap-12">
      {/* ------------------------------ Stage ------------------------------ */}
      <div className="relative lg:order-last lg:col-span-7">
        {/* Square from xl up, where the list fits beside it; on narrower
            desktops the text wraps taller, so the photo stretches to match. */}
        <div className="relative overflow-hidden rounded-5xl bg-teal-900 shadow-lift ring-1 ring-line lg:sticky lg:top-28 lg:h-full">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full xl:aspect-square">
            <AnimatePresence initial={false}>
              <motion.div
                key={active}
                className="absolute inset-0"
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0.2 : 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={current.image}
                  alt={current.alt}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  draggable={false}
                  className={cn("select-none object-cover", current.position)}
                />
              </motion.div>
            </AnimatePresence>

            {/* Legibility gradient under the summary card */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-teal-950/90 via-teal-950/20 to-transparent"
            />

            {/* Step counter */}
            <div className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold tracking-wider text-teal-800 shadow-card backdrop-blur-sm sm:left-7 sm:top-7">
              {String(active + 1).padStart(2, "0")} / {String(pillars.length).padStart(2, "0")}
            </div>
          </div>

          {/* Summary card — below the photo on phones, overlaid from sm up.
              popLayout keeps the outgoing card from collapsing the flow. */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: reduced ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -10 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative m-4 rounded-4xl bg-white/10 p-6 ring-1 ring-white/20 backdrop-blur-md sm:absolute sm:inset-x-7 sm:bottom-7 sm:m-0 sm:p-7"
            >
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-display text-4xl text-white sm:text-5xl">
                    {current.stat.value}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-olive-300">
                    {current.stat.label}
                  </p>
                </div>
                <span className="inline-flex size-13 items-center justify-center rounded-2xl bg-white/10 text-olive-300 ring-1 ring-white/15">
                  <current.Icon className="size-6" strokeWidth={1.6} aria-hidden />
                </span>
              </div>
              <ul className="mt-5 flex flex-wrap gap-2">
                {current.points.map((point, i) => (
                  <motion.li
                    key={point}
                    initial={{ opacity: 0, y: reduced ? 0 : 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.07, duration: 0.35 }}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20"
                  >
                    {point}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ------------------------------ Pillars ---------------------------- */}
      <div
        role="tablist"
        aria-label="Why patients choose the clinic"
        aria-orientation="vertical"
        // justify-between spreads the rows so the list ends level with the
        // square photo beside it on desktop.
        className="flex flex-col gap-2 lg:col-span-5 lg:justify-between"
      >
        {pillars.map(({ Icon, title, detail }, i) => {
          const selected = i === active;
          return (
            <button
              key={title}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(i)}
              onKeyDown={(event) => {
                if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
                event.preventDefault();
                const step = event.key === "ArrowDown" ? 1 : -1;
                const next = (i + step + pillars.length) % pillars.length;
                setActive(next);
                const sibling = event.currentTarget.parentElement?.children[next];
                (sibling as HTMLElement | undefined)?.focus();
              }}
              className={cn(
                "group relative overflow-hidden rounded-4xl px-5 text-left transition-[background-color,box-shadow,ring-color,padding] duration-400 ease-[var(--ease-out-soft)] sm:px-6",
                selected
                  ? "bg-card py-5 shadow-lift ring-1 ring-teal-100 sm:py-6"
                  : "py-2.5 ring-1 ring-transparent hover:bg-card/60 hover:ring-line",
              )}
            >
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "inline-flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1 transition-colors duration-400",
                    selected
                      ? "bg-teal-800 text-olive-300 ring-teal-800"
                      : "bg-teal-50 text-olive-600 ring-teal-100",
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.6} aria-hidden />
                </span>
                <span className="text-xs font-semibold tracking-wider text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  className={cn(
                    "font-display text-xl transition-colors duration-400 sm:text-2xl",
                    selected ? "text-teal-800" : "text-teal-800/70 group-hover:text-teal-800",
                  )}
                >
                  {title}
                </h3>
              </div>

              <AnimatePresence initial={false}>
                {selected && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <span className="block pt-4 leading-relaxed text-muted sm:pl-16">
                      {detail}
                    </span>
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Autoplay progress */}
              {selected && (
                <span aria-hidden className="absolute inset-x-6 bottom-0 h-0.5 overflow-hidden rounded-full bg-teal-50">
                  <motion.span
                    key={active}
                    className="block h-full origin-left bg-olive-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: INTERVAL_MS / 1000, ease: "linear" }}
                  />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
