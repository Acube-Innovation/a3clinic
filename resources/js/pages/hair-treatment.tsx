import { ArrowRight, ArrowUpRight, Check } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { HairSpeciality } from "@/components/sections/HairSpeciality";
import { ConsultationProcess } from "@/components/sections/ConsultationProcess";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { BookingCta } from "@/components/sections/BookingCta";
import type { ConditionCard, ResultPair } from "@/data/conditions";
import type { Product } from "@/data/products";
import programmeFaqs from "@/data/hair-programme-faqs.json";


const inclusions = [
  "A detailed first consultation of roughly forty-five minutes",
  "Review of existing blood reports, and specific testing where indicated",
  "Scalp and hair-shaft examination, in clinic or by photograph",
  "An individualised homeopathic prescription",
  "Nutritional and hair-care guidance specific to your scalp type",
  "Follow-up every four to six weeks with comparison photographs",
  "Prescription adjustment based on how you respond",
  "Medicines dispensed by the clinic and couriered to you",
];

export default function HairTreatmentPage({
  conditions,
  resultPairs,
  featuredProducts,
}: {
  conditions: ConditionCard[];
  resultPairs: ResultPair[];
  featuredProducts: Product[];
}) {
  const crumbs = [{ name: "Hair Treatment", href: "/hair-treatment" }];

  return (
    <>

      <PageHero
        eyebrow="The clinic's speciality"
        title="Hair treatment through homeopathy"
        description="Assessment before prescription, investigation before treatment, and honesty about what is achievable in your case."
        crumbs={crumbs}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/book" size="lg">
            Book a hair consultation
            <ArrowRight
              aria-hidden
              strokeWidth={2}
              className="size-4.5 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Button>
          <Button href="#conditions" size="lg" variant="secondary">
            See conditions treated
          </Button>
        </div>
      </PageHero>

      <HairSpeciality />

      {/* --------------------------- Conditions ---------------------------- */}
      <Section tone="platinum" id="conditions">
        <Container>
          <SectionHeading
            eyebrow="Hair conditions"
            title="The five most common presentations"
            description="Each has its own page covering symptoms, causes, how it is treated here, and a realistic view of what to expect."
          />

          <Stagger className="mt-16 grid gap-6 lg:grid-cols-2">
            {conditions.map((condition) => (
              <StaggerItem key={condition.slug} className="h-full">
                <Link
                  href={`/conditions/${condition.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-5xl bg-white ring-1 ring-line transition-[transform,box-shadow,ring-color] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-lift hover:ring-teal-100 sm:flex-row"
                >
                  <PlaceholderImage
                    slot={`Editorial image representing ${condition.name}`}
                    variant="editorial"
                    rounded="rounded-none"
                    className="aspect-[16/10] w-full shrink-0 sm:aspect-auto sm:w-44"
                  />

                  <div className="flex flex-1 flex-col p-7">
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
                    <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-muted">
                      {condition.summary}
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      {/* --------------------------- What is included ----------------------- */}
      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            <Reveal direction="right">
              <div className="relative">
                <PlaceholderImage
                  slot="Consultation room detail — case notes, reports and prescription pad on desk"
                  variant="clinic"
                  rounded="rounded-5xl"
                  className="aspect-[4/5] w-full"
                />
                <div
                  aria-hidden
                  className="blob-a absolute -inset-6 -z-10 bg-gradient-to-br from-teal-50 to-olive-50 blur-2xl"
                />
              </div>
            </Reveal>

            <div>
              <SectionHeading
                align="left"
                eyebrow="What the programme includes"
                title="Everything from first consultation to follow-up"
                description="There is no fixed-price package and no guaranteed-result plan. Treatment continues for as long as it is clinically useful and no longer."
              />

              <Stagger className="mt-10 flex flex-col gap-4">
                {inclusions.map((item) => (
                  <StaggerItem key={item}>
                    <div className="flex gap-3.5">
                      <span className="mt-0.5 grid size-5.5 shrink-0 place-items-center rounded-full bg-olive-100 text-olive-700">
                        <Check className="size-3" strokeWidth={3} aria-hidden />
                      </span>
                      <span className="leading-relaxed text-ink/80">{item}</span>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>

              <Reveal delay={0.2}>
                <Button href="/book" size="lg" className="mt-10">
                  Book a consultation
                </Button>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <ConsultationProcess />
      <BeforeAfter results={resultPairs} />

      {/* ------------------------------- FAQs ------------------------------- */}
      <Section tone="platinum">
        <Container>
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              eyebrow="Questions"
              title="About the hair programme"
            />
            <Reveal delay={0.1} className="mt-12">
              <Accordion items={programmeFaqs} />
            </Reveal>
          </div>
        </Container>
      </Section>

      <FeaturedProducts products={featuredProducts} />
      <BookingCta />
    </>
  );
}
