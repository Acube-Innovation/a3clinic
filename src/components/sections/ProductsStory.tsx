import { Beaker, Leaf, ShieldCheck, SprayCan } from "lucide-react";

import { Container, Section, Eyebrow } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Reveal } from "@/components/motion/Reveal";

const points = [
  {
    Icon: Beaker,
    title: "Formulated in the clinic",
    detail:
      "Developed by Dr. Riji in response to a recurring problem — patients following good treatment while using harsh products that undid the progress.",
  },
  {
    Icon: Leaf,
    title: "No mineral oil, no added fragrance",
    detail:
      "Cold-pressed bases and botanical actives. Full ingredient lists are published on every product page, not summarised.",
  },
  {
    Icon: SprayCan,
    title: "Deliberately a small range",
    detail:
      "A four-step routine plus a handful of skin and supplement lines. No seasonal launches, no variants that exist only to widen the shelf.",
  },
  {
    Icon: ShieldCheck,
    title: "Support, not substitute",
    detail:
      "These are cosmetic hair and skin preparations. They support treatment; they do not replace consultation, and they are not sold as cures.",
  },
];

export function ProductsStory() {
  return (
    <Section tone="platinum" id="products-story">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <Reveal>
              <Eyebrow>Doctor formulated</Eyebrow>
            </Reveal>

            <Reveal delay={0.05}>
              <h2 className="mt-6 text-h2 text-teal-800">
                The products came out of the consultation room
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-6 text-lead text-muted">
                Patients were following their treatment carefully and still
                struggling — because the shampoo they used four times a week was
                stripping the scalp, or the oil was sitting on it for three days
                feeding exactly what was causing the flaking.
              </p>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mt-4 leading-relaxed text-muted">
                The range exists to close that gap. It is small, deliberately so,
                and every formulation is one Dr. Riji is willing to recommend at
                a consultation.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-7 sm:grid-cols-2">
              {points.map(({ Icon, title, detail }, index) => (
                <Reveal key={title} delay={0.05 * index}>
                  <span className="grid size-11 place-items-center rounded-2xl bg-white text-olive-600 ring-1 ring-line">
                    <Icon className="size-5" strokeWidth={1.7} aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-teal-800">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">
                    {detail}
                  </p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.24}>
              <Button href="/shop" size="lg" className="mt-12">
                Browse the range
              </Button>
            </Reveal>
          </div>

          {/* ------------------------------ Visual ----------------------------- */}
          <Reveal direction="left" className="relative">
            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-5 pt-10">
                <PlaceholderImage
                  slot="Hair oil bottle, styled flat-lay on stone with botanical sprigs"
                  variant="product"
                  rounded="rounded-4xl"
                  className="aspect-[3/4] w-full"
                />
                <PlaceholderImage
                  slot="Raw botanical ingredients — bhringraj, brahmi, rosemary — arranged on linen"
                  variant="editorial"
                  rounded="rounded-4xl"
                  className="aspect-square w-full"
                />
              </div>
              <div className="flex flex-col gap-5">
                <PlaceholderImage
                  slot="Full product range grouped together on a neutral background"
                  variant="clinic"
                  rounded="rounded-4xl"
                  className="aspect-square w-full"
                />
                <PlaceholderImage
                  slot="Serum bottle held in hand, close-up, soft daylight"
                  variant="product"
                  rounded="rounded-4xl"
                  className="aspect-[3/4] w-full"
                />
              </div>
            </div>

            <div
              aria-hidden
              className="blob-b absolute -inset-8 -z-10 bg-gradient-to-br from-teal-100/60 to-olive-100/60 blur-2xl"
            />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
