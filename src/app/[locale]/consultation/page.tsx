import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Building2, Check, MonitorSmartphone } from "lucide-react";

import { pageMetadata, breadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/i18n/routing";
import { PageHero } from "@/components/layout/PageHero";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ConsultationProcess } from "@/components/sections/ConsultationProcess";
import { FaqSection } from "@/components/sections/FaqSection";
import { BookingCta } from "@/components/sections/BookingCta";
import { getConsultationContent } from "@/data/consultation";

const modes = [
  {
    Icon: MonitorSmartphone,
    title: "Online consultation",
    subtitle: "By video, from anywhere",
    points: [
      "Same forty-five minute first consultation",
      "Reports and photographs reviewed before the call",
      "Secure link sent by WhatsApp and email — no app to install",
      "Medicines couriered to your address",
      "Suited to most hair, skin and chronic conditions",
    ],
    footnote:
      "If your case needs physical examination, you will be told and asked to attend in person rather than treated at a distance.",
  },
  {
    Icon: Building2,
    title: "Clinic consultation",
    subtitle: "In Kattakkada, Thiruvananthapuram",
    points: [
      "Direct scalp and skin examination",
      "Dermatoscopic assessment where indicated",
      "Medicines dispensed on the spot",
      "Standardised progress photographs taken in clinic",
      "Preferred for complex or unclear presentations",
    ],
    footnote:
      "Morning and evening sessions Monday to Saturday. Booking ahead is strongly advised — walk-in waiting times vary considerably.",
  },
];



export async function generateMetadata({
  params,
}: PageProps<"/[locale]/consultation">): Promise<Metadata> {
  const { locale } = await params;

  return pageMetadata({
    locale: locale as Locale,
    path: "/consultation",
    title: "Online & Clinic Consultation",
    description:
      "Consult Dr. Riji Rasheed (BHMS) by video from anywhere, or in person at the Kattakkada clinic. How consultation works, what to prepare, and how medicines are delivered.",
  });
}

export default async function ConsultationPage({
  params,
}: PageProps<"/[locale]/consultation">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { prepare, deliveryNote } = await getConsultationContent();
  const crumbs = [{ name: "Consultation", href: "/consultation" }];

  return (
    <>
      <JsonLd schema={breadcrumbSchema(crumbs, locale as Locale)} />

      <PageHero
        eyebrow="Consultation"
        title="Two ways to consult, one standard of care"
        description="Whether you attend in Kattakkada or join by video from abroad, the consultation, the follow-up schedule and the attention are the same."
        crumbs={crumbs}
      >
        <Button href="/book" size="lg">
          Book an appointment
          <ArrowRight
            aria-hidden
            strokeWidth={2}
            className="size-4.5 transition-transform duration-300 group-hover:translate-x-1"
          />
        </Button>
      </PageHero>

      {/* ------------------------------ Modes ------------------------------ */}
      <Section>
        <Container>
          <Stagger className="grid gap-6 lg:grid-cols-2">
            {modes.map((mode) => (
              <StaggerItem key={mode.title} className="h-full">
                <div className="flex h-full flex-col rounded-5xl bg-card p-9 ring-1 ring-line sm:p-11">
                  <span className="grid size-13 place-items-center rounded-2xl bg-teal-50 text-olive-600 ring-1 ring-teal-100">
                    <mode.Icon className="size-6" strokeWidth={1.6} aria-hidden />
                  </span>

                  <h2 className="mt-7 text-h3 text-teal-800">{mode.title}</h2>
                  <p className="mt-1.5 text-sm font-medium uppercase tracking-wider text-olive-600">
                    {mode.subtitle}
                  </p>

                  <ul className="mt-7 flex flex-1 flex-col gap-3.5">
                    {mode.points.map((point) => (
                      <li key={point} className="flex gap-3.5">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-olive-100 text-olive-700">
                          <Check className="size-3" strokeWidth={3} aria-hidden />
                        </span>
                        <span className="leading-relaxed text-muted">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-8 border-t border-line pt-6 text-sm leading-relaxed text-muted">
                    {mode.footnote}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      <ConsultationProcess />

      {/* ----------------------------- Prepare ----------------------------- */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Before your appointment"
            title="What to have ready"
            description="A consultation is only as good as the information it starts with. These four things make the biggest difference."
          />

          <Stagger className="mt-16 grid gap-6 sm:grid-cols-2">
            {prepare.map((item, index) => (
              <StaggerItem key={item.title} className="h-full">
                <div className="flex h-full gap-5 rounded-4xl bg-card p-7 ring-1 ring-line">
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-teal-50 font-display text-lg text-teal-800 ring-1 ring-teal-100">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-teal-800">
                      {item.title}
                    </h3>
                    <p className="mt-2 leading-relaxed text-muted">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mx-auto mt-14 max-w-3xl">
            <div className="rounded-4xl bg-platinum p-7 ring-1 ring-line sm:p-8">
              <h3 className="text-lg font-semibold text-teal-800">
                Medicine delivery
              </h3>
              <p className="mt-3 leading-relaxed text-muted">{deliveryNote}</p>
            </div>
          </Reveal>
        </Container>
      </Section>

      <FaqSection />
      <BookingCta />
    </>
  );
}
