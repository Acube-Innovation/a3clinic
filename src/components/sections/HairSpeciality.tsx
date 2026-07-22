import { ArrowRight, Microscope, Route, ScanFace, Sprout } from "lucide-react";

import { Container, Section, Eyebrow } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Reveal } from "@/components/motion/Reveal";

const stages = [
  {
    Icon: ScanFace,
    title: "Assessment",
    detail:
      "Scalp and hair-shaft examination, pattern mapping, and a full systemic history — in person or through clear uploaded photographs.",
  },
  {
    Icon: Microscope,
    title: "Investigation",
    detail:
      "Thyroid, ferritin, vitamin D and hormonal testing where the history indicates it. Existing reports are reviewed rather than repeated.",
  },
  {
    Icon: Sprout,
    title: "Treatment",
    detail:
      "An individualised homeopathic prescription, nutritional correction, and a hair-care routine built around your scalp type.",
  },
  {
    Icon: Route,
    title: "Review",
    detail:
      "Follow-up every four to six weeks with standardised comparison photographs, and the prescription adjusted to your response.",
  },
];

export function HairSpeciality() {
  return (
    <Section id="hair-speciality">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* ------------------------------ Visual ----------------------------- */}
          <Reveal direction="right" className="relative order-last lg:order-first">
            <div className="relative">
              <PlaceholderImage
                slot="Close-up of scalp examination during consultation, hands and dermatoscope, shallow depth of field"
                variant="editorial"
                rounded="rounded-5xl"
                className="aspect-[4/5] w-full"
              />

              {/* Overlapping secondary image */}
              <div className="absolute -bottom-10 -right-4 w-44 rounded-4xl bg-white p-2 shadow-lift ring-1 ring-line sm:-right-10 sm:w-56">
                <PlaceholderImage
                  slot="Patient consultation, doctor explaining a report on screen"
                  variant="clinic"
                  rounded="rounded-3xl"
                  className="aspect-square w-full"
                />
              </div>

              {/* Floating metric */}
              <div className="absolute -left-4 top-10 rounded-3xl bg-white/90 px-5 py-4 shadow-card ring-1 ring-line backdrop-blur-sm sm:-left-10">
                <p className="font-display text-3xl text-teal-800">~45 min</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">
                  First consultation
                </p>
              </div>
            </div>
          </Reveal>

          {/* ------------------------------ Copy ------------------------------- */}
          <div>
            <Reveal>
              <Eyebrow>The clinic&rsquo;s speciality</Eyebrow>
            </Reveal>

            <Reveal delay={0.05}>
              <h2 className="mt-6 text-h2 text-teal-800">
                Hair treatment that starts with the whole body
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-6 text-lead text-muted">
                Most people arrive having already tried shampoos, oils and
                topical treatments. What is usually missing is the question of
                why the hair is behaving this way at all — thyroid function, iron
                stores, hormones, a recent illness, or an inflamed scalp that was
                never properly treated.
              </p>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mt-4 leading-relaxed text-muted">
                That question is where every hair consultation here begins.
              </p>
            </Reveal>

            <div className="mt-12 flex flex-col gap-8">
              {stages.map(({ Icon, title, detail }, index) => (
                <Reveal key={title} delay={0.05 * index} className="flex gap-5">
                  <span className="relative flex flex-col items-center">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-teal-50 text-olive-600 ring-1 ring-teal-100">
                      <Icon className="size-5" strokeWidth={1.7} aria-hidden />
                    </span>
                    {index < stages.length - 1 ? (
                      <span
                        aria-hidden
                        className="mt-2 w-px flex-1 bg-gradient-to-b from-teal-100 to-transparent"
                      />
                    ) : null}
                  </span>

                  <div className="pb-1">
                    <h3 className="text-lg font-semibold text-teal-800">
                      {title}
                    </h3>
                    <p className="mt-1.5 leading-relaxed text-muted">{detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2}>
              <Button href="/hair-treatment" size="lg" className="mt-12">
                Explore the hair programme
                <ArrowRight
                  aria-hidden
                  strokeWidth={2}
                  className="size-4.5 transition-transform duration-300 group-hover:translate-x-1"
                />
              </Button>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
