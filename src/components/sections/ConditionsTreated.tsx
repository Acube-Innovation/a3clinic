import { ArrowUpRight } from "lucide-react";

import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { getConditions, categoryLabels } from "@/data/conditions";

export async function ConditionsTreated() {
  const conditions = await getConditions();

  return (
    <Section tone="platinum" id="conditions">
      <Container>
        <SectionHeading
          eyebrow="Conditions treated"
          title="Hair and scalp care, within a full homeopathic practice"
          description="Hair is the clinic's speciality, but not its limit. Chronic, skin, women's health and paediatric conditions are treated with the same approach — find the cause, then prescribe for the person."
        />

        <Stagger className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {conditions.map((condition) => (
            <StaggerItem key={condition.slug}>
              <Link
                href={`/conditions/${condition.slug}`}
                className="group flex h-full flex-col rounded-4xl bg-card p-7 ring-1 ring-line transition-[transform,box-shadow,ring-color] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-lift hover:ring-teal-100"
              >
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
              </Link>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-14 flex justify-center">
          <Button href="/conditions" variant="secondary" size="lg">
            View all conditions
          </Button>
        </div>
      </Container>
    </Section>
  );
}
