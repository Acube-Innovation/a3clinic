import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Activity, ArrowRight, CircleAlert, Sprout, Stethoscope } from "lucide-react";

import { routing, type Locale } from "@/i18n/routing";
import {
  pageMetadata,
  breadcrumbSchema,
  faqSchema,
  medicalConditionSchema,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/layout/PageHero";
import { Container, Section, Eyebrow } from "@/components/ui/Section";
import { Card, IconTile } from "@/components/ui/Card";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { BookingCta } from "@/components/sections/BookingCta";
import { ResultPairsGrid } from "@/components/sections/ResultPairsGrid";
import { Link } from "@/i18n/navigation";
import {
  getConditionBySlug,
  getConditions,
  categoryLabels,
  pairsOf,
} from "@/data/conditions";

export async function generateStaticParams() {
  const conditions = await getConditions();
  // Cross-product of locales and slugs so every page is prerendered.
  return routing.locales.flatMap((locale) =>
    conditions.map((condition) => ({ locale, slug: condition.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/conditions/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const condition = await getConditionBySlug(slug);

  if (!condition) return {};

  return pageMetadata({
    locale: locale as Locale,
    path: `/conditions/${condition.slug}`,
    title: `${condition.name} — Homeopathic Treatment`,
    description: condition.summary,
  });
}

export default async function ConditionPage({
  params,
}: PageProps<"/[locale]/conditions/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const condition = await getConditionBySlug(slug);
  if (!condition) notFound();

  const pairs = pairsOf(condition);
  const all = await getConditions();
  const related = all
    .filter((c) => c.slug !== condition.slug && c.category === condition.category)
    .slice(0, 3);

  const crumbs = [
    { name: "Conditions", href: "/conditions" },
    { name: condition.name, href: `/conditions/${condition.slug}` },
  ];

  return (
    <>
      <JsonLd
        schema={[
          medicalConditionSchema({
            name: condition.name,
            description: condition.summary,
            symptoms: condition.symptoms,
            causes: condition.causes,
          }),
          ...(condition.faqs.length > 0 ? [faqSchema(condition.faqs)] : []),
          breadcrumbSchema(crumbs, locale as Locale),
        ]}
      />

      <PageHero
        eyebrow={categoryLabels[condition.category]}
        title={condition.name}
        description={condition.summary}
        crumbs={crumbs}
        image={condition.heroImage || undefined}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/book" size="lg">
            Book a consultation
            <ArrowRight
              aria-hidden
              strokeWidth={2}
              className="size-4.5 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Button>
          <Button href="/hair-treatment" size="lg" variant="secondary">
            The hair programme
          </Button>
        </div>
      </PageHero>

      {/* ------------------------------ Intro ------------------------------ */}
      <Section size="sm">
        <Container>
          {condition.introImage ? (
            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
              <Reveal>
                <p className="text-lead text-ink/80">{condition.intro}</p>
              </Reveal>
              <Reveal direction="left">
                <figure className="relative overflow-hidden rounded-4xl ring-1 ring-line">
                  {/* Admin upload served from our /uploads route. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={condition.introImage}
                    alt={`What ${condition.name.toLowerCase()} can look like — illustrative image`}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-teal-800 backdrop-blur-sm">
                    Illustrative image
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          ) : (
            <Reveal className="mx-auto max-w-3xl">
              <p className="text-lead text-ink/80">{condition.intro}</p>
            </Reveal>
          )}
        </Container>
      </Section>

      {/* ------------------------ Symptoms & causes ------------------------ */}
      {condition.symptoms.length > 0 || condition.causes.length > 0 ? (
      <Section tone="platinum" size="sm">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal direction="right">
              <Card hover={false} className="h-full">
                <IconTile>
                  <Activity className="size-6" strokeWidth={1.6} aria-hidden />
                </IconTile>
                <h2 className="mt-6 text-h3 text-teal-800">
                  Symptoms to look for
                </h2>
                <ul className="mt-6 flex flex-col gap-3.5">
                  {condition.symptoms.map((symptom) => (
                    <li key={symptom} className="flex gap-3.5">
                      <span
                        aria-hidden
                        className="mt-2.5 size-1.5 shrink-0 rounded-full bg-olive-500"
                      />
                      <span className="leading-relaxed text-muted">
                        {symptom}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>

            <Reveal direction="left">
              <Card hover={false} className="h-full">
                <IconTile>
                  <CircleAlert className="size-6" strokeWidth={1.6} aria-hidden />
                </IconTile>
                <h2 className="mt-6 text-h3 text-teal-800">Common causes</h2>
                <ul className="mt-6 flex flex-col gap-3.5">
                  {condition.causes.map((cause) => (
                    <li key={cause} className="flex gap-3.5">
                      <span
                        aria-hidden
                        className="mt-2.5 size-1.5 shrink-0 rounded-full bg-teal-400"
                      />
                      <span className="leading-relaxed text-muted">{cause}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          </div>
        </Container>
      </Section>
      ) : null}

      {/* ----------------------------- Treatment ---------------------------- */}
      {condition.treatment.length > 0 ? (
      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <Reveal>
                <Eyebrow>The approach</Eyebrow>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-6 text-h2 text-teal-800">
                  How it is treated here
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-5 leading-relaxed text-muted">
                  Homeopathic prescribing is individualised. Two people with the
                  same diagnosis often receive different prescriptions, because
                  selection depends on the whole picture rather than the label.
                </p>
              </Reveal>
            </div>

            <Stagger className="flex flex-col gap-5">
              {condition.treatment.map((step, index) => (
                <StaggerItem key={step}>
                  <div className="flex gap-5 rounded-4xl bg-card p-6 ring-1 ring-line sm:p-7">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-teal-50 font-display text-lg text-teal-800 ring-1 ring-teal-100">
                      {index + 1}
                    </span>
                    <p className="self-center leading-relaxed text-ink/80">
                      {step}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Container>
      </Section>
      ) : null}

      {/* -------------------------- Expected results ------------------------ */}
      {condition.expectedResults.length > 0 ? (
      <Section tone="teal">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <Eyebrow tone="dark">What to expect</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-6 text-h2 text-white">
                A realistic timeline
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 text-lead text-teal-100/75">
                Set out honestly, including where progress is slow or where
                treatment may not help.
              </p>
            </Reveal>
          </div>

          <Stagger className="mt-16 grid gap-5 sm:grid-cols-2">
            {condition.expectedResults.map((phase) => (
              <StaggerItem key={phase.phase} className="h-full">
                <div className="h-full rounded-4xl bg-white/5 p-8 ring-1 ring-white/10">
                  <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-olive-300">
                    {phase.phase}
                  </span>
                  <p className="mt-4 leading-relaxed text-teal-100/80">
                    {phase.detail}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <p className="mx-auto mt-12 max-w-3xl text-center text-sm leading-relaxed text-teal-100/50">
            Timelines are indicative and drawn from typical clinical experience.
            They are not a prediction or guarantee for any individual. Response
            varies with cause, duration and factors outside the clinic&rsquo;s
            control.
          </p>
        </Container>
      </Section>
      ) : null}

      {/* --------------------------- Before & after -------------------------- */}
      {pairs.length > 0 ? (
        <Section tone="platinum">
          <Container>
            <div className="mx-auto max-w-4xl">
              <Reveal>
                <Eyebrow>Documenting progress</Eyebrow>
                <h2 className="mt-6 text-h2 text-teal-800">
                  Before &amp; after — {condition.name.toLowerCase()}
                </h2>
              </Reveal>

              <Reveal delay={0.1} className="mt-10">
                <div className="overflow-hidden rounded-5xl bg-white p-6 ring-1 ring-line sm:p-10">
                  <ResultPairsGrid pairs={pairs} />
                </div>
              </Reveal>
            </div>
          </Container>
        </Section>
      ) : null}

      {/* ------------------------------- FAQs ------------------------------- */}
      {condition.faqs.length > 0 ? (
      <Section>
        <Container>
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <Eyebrow>Questions</Eyebrow>
              <h2 className="mt-6 text-h2 text-teal-800">
                About {condition.name.toLowerCase()}
              </h2>
            </Reveal>

            <Reveal delay={0.1} className="mt-10">
              <Accordion items={condition.faqs} />
            </Reveal>
          </div>
        </Container>
      </Section>
      ) : null}

      {/* ------------------------------ Related ----------------------------- */}
      {related.length > 0 ? (
        <Section tone="platinum" size="sm">
          <Container>
            <div className="flex items-baseline gap-5">
              <h2 className="text-h3 text-teal-800">Related conditions</h2>
              <span aria-hidden className="rule-olive flex-1" />
            </div>

            <Stagger className="mt-9 grid gap-5 sm:grid-cols-3">
              {related.map((item) => (
                <StaggerItem key={item.slug} className="h-full">
                  <Link
                    href={`/conditions/${item.slug}`}
                    className="group flex h-full flex-col rounded-4xl bg-white p-7 ring-1 ring-line transition-[transform,box-shadow] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-lift"
                  >
                    <span className="grid size-10 place-items-center rounded-2xl bg-teal-50 text-olive-600">
                      <Sprout className="size-5" strokeWidth={1.7} aria-hidden />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-teal-800 transition-colors group-hover:text-teal-600">
                      {item.name}
                    </h3>
                    <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">
                      {item.summary}
                    </p>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </Section>
      ) : null}

      {/* --------------------------- Safety notice -------------------------- */}
      <Section size="sm">
        <Container>
          <div className="mx-auto flex max-w-4xl gap-4 rounded-4xl bg-platinum p-7 ring-1 ring-line sm:p-8">
            <Stethoscope
              className="mt-0.5 size-6 shrink-0 text-olive-600"
              strokeWidth={1.6}
              aria-hidden
            />
            <p className="text-sm leading-relaxed text-muted">
              <span className="font-semibold text-teal-800">
                This page is general information, not medical advice.
              </span>{" "}
              It cannot account for your individual history and should not be
              used to self-diagnose or self-treat. Homeopathic treatment works
              alongside conventional medical care — never stop or change a
              medication prescribed by another doctor without speaking to that
              doctor. In an emergency, seek immediate hospital care.
            </p>
          </div>
        </Container>
      </Section>

      <BookingCta />
    </>
  );
}
