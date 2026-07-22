import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Award, GraduationCap, Compass, Eye } from "lucide-react";

import { pageMetadata, breadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/i18n/routing";
import { PageHero } from "@/components/layout/PageHero";
import { Container, Section, SectionHeading, Eyebrow } from "@/components/ui/Section";
import { Card, IconTile } from "@/components/ui/Card";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { BookingCta } from "@/components/sections/BookingCta";
import { doctor } from "@/lib/site";
import { getDoctorProfile } from "@/data/doctor";
import { getGallery } from "@/data/gallery";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;

  return pageMetadata({
    locale: locale as Locale,
    path: "/about",
    title: "About Dr. Riji Rasheed (BHMS)",
    description:
      "Dr. Riji Rasheed, BHMS — homeopathic physician in Kattakkada, Kerala, with a clinical focus on hair and scalp disorders alongside general homeopathic practice.",
  });
}

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { biography, education, timeline, achievements, mission, gallery } =
    await getDoctorProfile();
  const photos = await getGallery();

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([{ name: "About", href: "/about" }], locale as Locale)}
      />

      <PageHero
        eyebrow="About the doctor"
        title={`${doctor.name}, ${doctor.credentials}`}
        description={biography.intro}
        crumbs={[{ name: "About", href: "/about" }]}
      />

      {/* ---------------------------- Biography ---------------------------- */}
      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
            <Reveal direction="right">
              <div className="lg:sticky lg:top-32">
                <div className="relative rounded-[2.75rem] bg-white p-2.5 shadow-lift ring-1 ring-olive-200/70">
                  <PlaceholderImage
                    slot="Dr. Riji Rasheed — editorial portrait, seated at consultation desk, three-quarter view"
                    variant="portrait"
                    rounded="rounded-[2.25rem]"
                    className="aspect-[4/5] w-full"
                  />
                </div>

                <div className="mt-6 rounded-4xl bg-platinum p-6 ring-1 ring-line">
                  <p className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-olive-600">
                    Registration
                  </p>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">
                    {doctor.registration}
                  </p>
                </div>
              </div>
            </Reveal>

            <div>
              <Reveal>
                <Eyebrow>The practice</Eyebrow>
                <h2 className="mt-6 text-h2 text-teal-800">
                  How hair became the focus
                </h2>
              </Reveal>

              <div className="mt-8 flex flex-col gap-6">
                {biography.paragraphs.map((paragraph, index) => (
                  <Reveal key={index} delay={0.04 * index}>
                    <p className="text-lead leading-relaxed text-muted">
                      {paragraph}
                    </p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ----------------------------- Timeline ---------------------------- */}
      <Section tone="platinum">
        <Container>
          <SectionHeading
            eyebrow="Experience"
            title="The practice over time"
            align="left"
          />

          <Stagger className="mt-16 flex flex-col">
            {timeline.map((entry, index) => (
              <StaggerItem key={entry.year}>
                <div className="grid gap-4 border-t border-line py-8 sm:grid-cols-[8rem_1fr] sm:gap-10 lg:grid-cols-[10rem_1fr]">
                  <span className="font-display text-3xl text-olive-600">
                    {entry.year}
                  </span>
                  <div>
                    <h3 className="text-h3 text-teal-800">{entry.title}</h3>
                    <p className="mt-2.5 max-w-2xl leading-relaxed text-muted">
                      {entry.detail}
                    </p>
                  </div>
                </div>
                {index === timeline.length - 1 ? (
                  <div className="border-t border-line" />
                ) : null}
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      {/* ----------------------------- Education --------------------------- */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Education"
            title="Qualifications and training"
            description="TODO(client): every entry below is placeholder text and must be verified against certificates before launch."
          />

          <Stagger className="mt-16 grid gap-6 lg:grid-cols-3">
            {education.map((item) => (
              <StaggerItem key={item.qualification} className="h-full">
                <Card className="h-full">
                  <IconTile>
                    <GraduationCap className="size-6" strokeWidth={1.6} aria-hidden />
                  </IconTile>
                  <p className="mt-6 font-display text-2xl text-olive-600">
                    {item.year}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold leading-snug text-teal-800">
                    {item.qualification}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-teal-600">
                    {item.institution}
                  </p>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
                    {item.detail}
                  </p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      {/* ------------------------- Mission and vision ---------------------- */}
      <Section tone="teal">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal direction="right">
              <div className="h-full rounded-5xl bg-white/5 p-9 ring-1 ring-white/10 sm:p-11">
                <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-olive-300 ring-1 ring-white/15">
                  <Compass className="size-6" strokeWidth={1.6} aria-hidden />
                </span>
                <h2 className="mt-7 text-h3 text-white">Mission</h2>
                <p className="mt-4 text-lead leading-relaxed text-teal-100/75">
                  {mission.mission}
                </p>
              </div>
            </Reveal>

            <Reveal direction="left">
              <div className="h-full rounded-5xl bg-white/5 p-9 ring-1 ring-white/10 sm:p-11">
                <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-olive-300 ring-1 ring-white/15">
                  <Eye className="size-6" strokeWidth={1.6} aria-hidden />
                </span>
                <h2 className="mt-7 text-h3 text-white">Vision</h2>
                <p className="mt-4 text-lead leading-relaxed text-teal-100/75">
                  {mission.vision}
                </p>
              </div>
            </Reveal>
          </div>

          <Stagger className="mt-6 grid gap-6 sm:grid-cols-2">
            {mission.values.map((value) => (
              <StaggerItem key={value.title} className="h-full">
                <div className="h-full rounded-4xl bg-white/5 p-8 ring-1 ring-white/10">
                  <h3 className="text-lg font-semibold text-white">
                    {value.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-teal-100/70">
                    {value.detail}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      {/* ---------------------------- Achievements -------------------------- */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Beyond the clinic"
            title="Community work and formulation"
          />

          <Stagger className="mt-16 grid gap-6 sm:grid-cols-2">
            {achievements.map((item) => (
              <StaggerItem key={item.title} className="h-full">
                <Card className="h-full">
                  <IconTile>
                    <Award className="size-6" strokeWidth={1.6} aria-hidden />
                  </IconTile>
                  <h3 className="mt-6 text-h3 text-teal-800">{item.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{item.detail}</p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      {/* ------------------------------ Gallery ----------------------------- */}
      <Section tone="platinum">
        <Container>
          <SectionHeading
            eyebrow="The clinic"
            title="Where consultations happen"
            description={
              photos.length > 0
                ? "A look inside the Kattakkada clinic."
                : "Placeholder tiles — upload real photographs from Admin → Clinic Photos and they appear here."
            }
          />

          <Stagger className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.length > 0
              ? photos.map((item) => (
                  <StaggerItem key={item.image}>
                    <figure className="relative overflow-hidden rounded-4xl">
                      {/* Admin uploads are served from our own /uploads route;
                          plain img avoids the optimizer for runtime files. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.label || "Inside the clinic"}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover"
                      />
                      {item.label ? (
                        <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-teal-800 backdrop-blur-sm">
                          {item.label}
                        </figcaption>
                      ) : null}
                    </figure>
                  </StaggerItem>
                ))
              : gallery.map((item) => (
                  <StaggerItem key={item.slot}>
                    <PlaceholderImage
                      slot={item.slot}
                      label={item.label}
                      variant="clinic"
                      rounded="rounded-4xl"
                      className="aspect-[4/3] w-full"
                    />
                  </StaggerItem>
                ))}
          </Stagger>
        </Container>
      </Section>

      <BookingCta />
    </>
  );
}
