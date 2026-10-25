import { ArrowRight, ArrowUpRight, LayoutGrid } from "lucide-react";

import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Link } from "@/i18n/navigation";
import { ConditionCardMedia } from "@/components/conditions/ConditionCardMedia";
import { getConditions, categoryLabels } from "@/data/conditions";
import type { Condition } from "@/data/conditions";

const FEATURED_COUNT = 6;
const CLOUD_ROWS = 3;
const PER_ROW = 12;

/**
 * Deterministic shuffle (mulberry32) so the cloud looks random but renders
 * identically on every request — no hydration or cache churn.
 */
function shuffled<T>(items: T[], seed = 7): T[] {
  const out = [...items];
  let t = seed;
  const rand = () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** One endlessly scrolling row of condition links; pauses on hover/focus. */
function CloudRow({ items, reverse }: { items: Condition[]; reverse?: boolean }) {
  const chip =
    "inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full bg-card px-4 text-sm font-medium text-teal-800 ring-1 ring-line transition-colors duration-300 hover:bg-teal-50 hover:text-teal-600 hover:ring-teal-200";
  return (
    <div className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      {/* Content is rendered twice so the -50% marquee loop is seamless;
          the second copy is hidden from assistive tech and the tab order. */}
      <div
        className={
          "flex w-max animate-marquee gap-3 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]" +
          (reverse ? " [animation-direction:reverse]" : "")
        }
      >
        {[false, true].map((copy) =>
          items.map((condition) => (
            <Link
              key={`${copy}-${condition.slug}`}
              href={`/conditions/${condition.slug}`}
              className={chip}
              aria-hidden={copy || undefined}
              tabIndex={copy ? -1 : undefined}
            >
              {condition.name}
            </Link>
          )),
        )}
      </div>
    </div>
  );
}

export async function ConditionsTreated() {
  const conditions = await getConditions();
  const featured = conditions.slice(0, FEATURED_COUNT);
  const cloud = shuffled(conditions.slice(FEATURED_COUNT));
  const rows = Array.from({ length: CLOUD_ROWS }, (_, i) =>
    cloud.slice(i * PER_ROW, (i + 1) * PER_ROW),
  );

  return (
    <Section tone="platinum" id="conditions">
      <Container>
        <SectionHeading
          eyebrow="Conditions treated"
          title="Hair and scalp care, within a full homeopathic practice"
          description="Hair is the clinic's speciality, but not its limit. Chronic, skin, women's health and paediatric conditions are treated with the same approach — find the cause, then prescribe for the person."
        />

        <Stagger className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((condition) => (
            <StaggerItem key={condition.slug}>
              <Link
                href={`/conditions/${condition.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-4xl bg-card ring-1 ring-line transition-[transform,box-shadow,ring-color] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-lift hover:ring-teal-100"
              >
                <ConditionCardMedia condition={condition} />

                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-olive-600">
                      {categoryLabels[condition.category]}
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      strokeWidth={1.75}
                      className="size-5 shrink-0 text-line transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-olive-500"
                    />
                  </div>

                  <h3 className="mt-4 text-h3 text-teal-800 transition-colors duration-300 group-hover:text-teal-600">
                    {condition.name}
                  </h3>

                  <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-muted">
                    {condition.summary}
                  </p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>

        {/* View-all block + condition cloud. items-stretch keeps the block
            exactly as tall as the three cloud rows (3 × h-10 + 2 × gap-3). */}
        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-[23.5rem_1fr]">
          <Link
            href="/conditions"
            className="group flex items-center gap-5 rounded-4xl bg-olive-300 px-6 py-5 text-teal-900 shadow-soft transition-[transform,box-shadow,background-color] duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-0.5 hover:bg-olive-200 hover:shadow-lift"
          >
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-teal-900/10">
              <LayoutGrid aria-hidden strokeWidth={1.8} className="size-6" />
            </span>
            <span className="flex-1">
              <span className="block whitespace-nowrap font-display text-xl leading-tight xl:text-2xl">
                View all conditions
              </span>
              <span className="mt-1 block text-sm font-medium text-teal-900/70">
                {conditions.length} conditions treated
              </span>
            </span>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-teal-900 text-olive-300 transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight aria-hidden strokeWidth={2} className="size-5" />
            </span>
          </Link>

          <nav aria-label="More conditions treated" className="flex min-w-0 flex-col gap-3">
            {rows.map((row, i) => (
              <CloudRow key={i} items={row} reverse={i % 2 === 1} />
            ))}
          </nav>
        </div>
      </Container>
    </Section>
  );
}
