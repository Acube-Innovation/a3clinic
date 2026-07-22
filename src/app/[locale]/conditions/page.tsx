import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { pageMetadata, breadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/i18n/routing";
import { PageHero } from "@/components/layout/PageHero";
import { Container, Section } from "@/components/ui/Section";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { BookingCta } from "@/components/sections/BookingCta";
import {
  getConditions,
  categoryLabels,
  type ConditionCategory,
} from "@/data/conditions";

const categoryOrder: ConditionCategory[] = [
  "hair",
  "skin",
  "chronic",
  "womens",
  "child",
];

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/conditions">): Promise<Metadata> {
  const { locale } = await params;

  return pageMetadata({
    locale: locale as Locale,
    path: "/conditions",
    title: "Conditions Treated",
    description:
      "Homeopathic treatment for hair fall, alopecia, dandruff, skin disease, thyroid disorders, PCOD, allergies, migraine and children's health at Dr. Riji's Health Care, Kattakkada.",
  });
}

export default async function ConditionsPage({
  params,
}: PageProps<"/[locale]/conditions">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const conditions = await getConditions();

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema(
          [{ name: "Conditions", href: "/conditions" }],
          locale as Locale,
        )}
      />

      <PageHero
        eyebrow="Conditions treated"
        title="What the clinic treats"
        description="Hair and scalp disorders are the speciality. They sit inside a full homeopathic practice covering skin, chronic, women's health and paediatric conditions."
        crumbs={[{ name: "Conditions", href: "/conditions" }]}
      />

      <Section>
        <Container>
          <div className="flex flex-col gap-20">
            {categoryOrder.map((category) => {
              const group = conditions.filter((c) => c.category === category);
              if (group.length === 0) return null;

              return (
                <div key={category}>
                  <div className="flex items-baseline gap-5">
                    <h2 className="text-h3 text-teal-800">
                      {categoryLabels[category]}
                    </h2>
                    <span aria-hidden className="rule-olive flex-1" />
                  </div>

                  <Stagger className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {group.map((condition) => (
                      <StaggerItem key={condition.slug} className="h-full">
                        <Link
                          href={`/conditions/${condition.slug}`}
                          className="group flex h-full flex-col rounded-4xl bg-card p-7 ring-1 ring-line transition-[transform,box-shadow,ring-color] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-lift hover:ring-teal-100"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="text-h3 text-teal-800 transition-colors duration-300 group-hover:text-teal-600">
                              {condition.name}
                            </h3>
                            <ArrowUpRight
                              aria-hidden
                              strokeWidth={1.75}
                              className="mt-1 size-5 shrink-0 text-line transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-olive-500"
                            />
                          </div>

                          <p className="mt-3.5 flex-1 text-[0.9375rem] leading-relaxed text-muted">
                            {condition.summary}
                          </p>

                          <span className="mt-6 text-sm font-semibold text-olive-600">
                            Read about treatment
                          </span>
                        </Link>
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      <BookingCta />
    </>
  );
}
