import { Clock, Globe2, Play, ShieldCheck, Wifi } from "lucide-react";

import { Container, Section, Eyebrow } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Reveal } from "@/components/motion/Reveal";

const points = [
  {
    Icon: Clock,
    title: "Roughly 45 minutes",
    detail: "The same unhurried first consultation as in the clinic.",
  },
  {
    Icon: Globe2,
    title: "Consulted from 40+ countries",
    detail: "Timings arranged around your local time zone.",
  },
  {
    Icon: ShieldCheck,
    title: "Private and confidential",
    detail: "Reports and photographs stay within your patient record.",
  },
  {
    Icon: Wifi,
    title: "No app to install",
    detail: "A secure link arrives by WhatsApp and email before your slot.",
  },
];

export function VideoConsultation() {
  return (
    <Section id="video-consultation">
      <Container>
        <div className="overflow-hidden rounded-6xl bg-teal-900">
          <div className="grid items-center gap-0 lg:grid-cols-2">
            {/* ---------------------------- Media ---------------------------- */}
            <Reveal direction="right" className="relative">
              <div className="relative aspect-[4/3] w-full lg:aspect-auto lg:h-full lg:min-h-[34rem]">
                <PlaceholderImage
                  slot="Dr. Riji conducting a video consultation at the clinic desk, laptop visible, warm lighting"
                  variant="editorial"
                  rounded="rounded-none"
                  className="absolute inset-0 h-full w-full"
                />

                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-teal-950/70 via-teal-950/10 to-transparent"
                />

                {/* Play affordance — TODO(client): wire to the real clinic video */}
                <button
                  type="button"
                  aria-label="Play clinic introduction video"
                  className="group absolute inset-0 grid place-items-center"
                >
                  <span className="relative grid size-20 place-items-center rounded-full bg-white/95 text-teal-800 shadow-lift transition-transform duration-400 ease-[var(--ease-out-soft)] group-hover:scale-105">
                    <span
                      aria-hidden
                      className="absolute inset-0 animate-ping rounded-full bg-white/40 [animation-duration:2.5s]"
                    />
                    <Play
                      className="relative ml-1 size-7 fill-teal-800"
                      strokeWidth={0}
                      aria-hidden
                    />
                  </span>
                </button>
              </div>
            </Reveal>

            {/* ---------------------------- Copy ----------------------------- */}
            <div className="px-8 py-14 sm:px-12 lg:px-14 lg:py-20">
              <Reveal>
                <Eyebrow tone="dark">Video consultation</Eyebrow>
              </Reveal>

              <Reveal delay={0.05}>
                <h2 className="mt-6 text-h2 text-white">
                  Consult from wherever you are
                </h2>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="mt-6 text-lead text-teal-100/75">
                  Online consultation has been part of the practice since 2021.
                  Reports and photographs are reviewed before the call, so the
                  time is spent on your history and your plan rather than on
                  admin.
                </p>
              </Reveal>

              <dl className="mt-12 grid gap-7 sm:grid-cols-2">
                {points.map(({ Icon, title, detail }, index) => (
                  <Reveal key={title} delay={0.05 * index}>
                    <dt className="flex items-center gap-3 font-semibold text-white">
                      <Icon
                        className="size-5 shrink-0 text-olive-300"
                        strokeWidth={1.7}
                        aria-hidden
                      />
                      {title}
                    </dt>
                    <dd className="mt-1.5 pl-8 text-[0.9375rem] leading-relaxed text-teal-100/70">
                      {detail}
                    </dd>
                  </Reveal>
                ))}
              </dl>

              <Reveal delay={0.24}>
                <Button href="/book" size="lg" variant="olive" className="mt-12">
                  Book a video consultation
                </Button>
              </Reveal>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
