import Image from "next/image";
import { ArrowRight, Microscope, Route, ScanFace, Sprout } from "lucide-react";

import { Container, Section, Eyebrow } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
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
            {/* Infographic carries its own text, so it is shown whole —
                no overlays, no cropping. */}
            <Image
              src="/images/hair-care-programme.jpg"
              alt="Complete holistic hair care programme in four steps: 1. Assessment — systemic history and scalp examination; 2. Investigation — thyroid, ferritin, vitamin D and hormone testing; 3. Treatment — individualised prescription, nutritional correction and hair-care routine; 4. Review — 4–6 week follow-up, progress comparison and prescription adjustment."
              width={1024}
              height={1026}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="h-auto w-full rounded-5xl shadow-lift ring-1 ring-line"
            />
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
          </div>
        </div>

        {/* ------------------------- Full-width summary ----------------------- */}
        <div className="mt-20 border-t border-line pt-14 text-center lg:mt-24">
          <Reveal>
            <p className="text-lead text-muted">
              Most people arrive having already tried shampoos, oils and topical
              treatments. What is usually missing is the question of why the hair
              is behaving this way at all — thyroid function, iron stores,
              hormones, a recent illness, or an inflamed scalp that was never
              properly treated.
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <p className="mt-4 leading-relaxed text-muted">
              That question is where every hair consultation here begins.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <Button href="/hair-treatment" size="lg" className="mt-10">
              Explore the hair programme
              <ArrowRight
                aria-hidden
                strokeWidth={2}
                className="size-4.5 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Button>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
