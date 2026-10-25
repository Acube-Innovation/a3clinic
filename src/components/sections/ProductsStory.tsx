import Image from "next/image";
import { Beaker, Leaf, ShieldCheck, SprayCan } from "lucide-react";

import { Container, Section, Eyebrow } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/lib/site";

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

/**
 * Production stages shown beside the story. Set `src` (a file under
 * public/images) once the clinic's own photograph exists; until then the tile
 * renders a placeholder whose `slot` describes the shot needed.
 */
const stages: Array<{ title: string; slot: string; src?: string }> = [
  {
    title: "Lab formulation",
    slot: "Formulation at the lab bench — measuring botanical actives, gloved hands, glassware",
    src: "/images/product-stage-formulation.jpg",
  },
  {
    title: "Homeopathic mixing",
    slot: "Homeopathic preparation being mixed and potentised in the lab",
    src: "/images/product-stage-mixing.jpg",
  },
  {
    title: "Labelling",
    slot: "Finished bottles being labelled with the Dr. Riji's Health Care label",
    src: "/images/product-stage-labelling.jpg",
  },
  {
    title: "Packing",
    slot: "Products being packed into branded boxes in the lab, ready for dispatch",
    src: "/images/product-stage-packing.jpg",
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
            {/* Four production stages, 1-2 / 3-4; the right column sits lower
                for the staggered look of the original layout. */}
            <ol className="grid grid-cols-2 gap-5">
              {stages.map((stage, index) => (
                <li
                  key={stage.title}
                  className={index % 2 === 1 ? "translate-y-10" : undefined}
                >
                  <figure className="relative aspect-[4/5] overflow-hidden rounded-4xl shadow-card ring-1 ring-line">
                    {stage.src ? (
                      <Image
                        src={stage.src}
                        alt={`${stage.title} of ${site.name} products`}
                        fill
                        sizes="(min-width: 1024px) 22vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0">
                        <PlaceholderImage
                          slot={stage.slot}
                          variant={index % 2 === 0 ? "editorial" : "product"}
                          rounded="rounded-none"
                          className="h-full w-full"
                        />
                      </div>
                    )}

                    {/* Brand chip */}
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[0.6875rem] font-semibold text-teal-800 shadow-soft backdrop-blur-sm sm:left-4 sm:top-4 sm:px-3 sm:text-xs">
                      {site.name}
                    </span>

                    {/* Stage caption */}
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-teal-950/95 via-teal-950/65 to-transparent px-4 pb-4 pt-16 sm:px-5 sm:pb-5">
                      <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-olive-300">
                        Stage {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="mt-1 block font-display text-lg leading-tight text-white sm:text-xl">
                        {stage.title}
                      </span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ol>

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
