"use client";

import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal primitives. These are the ONLY place `whileInView` is used —
 * sections compose these rather than importing motion directly, which keeps
 * the "use client" boundary low and the animation language consistent.
 *
 * Every component respects prefers-reduced-motion by collapsing to a plain
 * render with no transform and no opacity transition.
 */

const DISTANCE = 16;

type Direction = "up" | "down" | "left" | "right" | "none";

function offsetFor(direction: Direction) {
  switch (direction) {
    case "up":
      return { y: DISTANCE };
    case "down":
      return { y: -DISTANCE };
    case "left":
      return { x: DISTANCE };
    case "right":
      return { x: -DISTANCE };
    case "none":
      return {};
  }
}

type RevealProps = {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span" | "article";
};

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  className,
  as = "div",
}: RevealProps) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Component
      data-reveal
      className={className}
      initial={{ opacity: 0, ...offsetFor(direction) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}

/* -------------------------------------------------------------------------- */

const staggerParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: DISTANCE },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Stagger({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol";
}) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Component
      data-reveal
      className={className}
      variants={staggerParent}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Component data-reveal className={className} variants={staggerChild}>
      {children}
    </Component>
  );
}

/* -------------------------------------------------------------------------- */

/** Counts up to `value` once scrolled into view. */
export function Counter({
  value,
  suffix = "",
  duration = 1600,
  className,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion();
  const [animated, setAnimated] = useState(0);

  // With reduced motion the final value is derived, not animated — so no state
  // is written during the effect and the number is correct on first paint.
  const display = reduced ? value : animated;

  useEffect(() => {
    if (!inView || reduced) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo — fast start, gentle settle
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setAnimated(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
