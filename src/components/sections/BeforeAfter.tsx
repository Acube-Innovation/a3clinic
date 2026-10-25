import Image from "next/image";
import { Camera, Info, Ruler, Sun } from "lucide-react";

import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { ResultPairsGrid } from "@/components/sections/ResultPairsGrid";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { getAllResultPairs } from "@/data/conditions";

/**
 * ⚠️ COMPLIANCE — READ BEFORE PUBLISHING REAL IMAGES
 *
 * India's Drugs & Magic Remedies (Objectionable Advertisements) Act 1954 and
 * the NMC's advertising regulations restrict before/after imagery and outcome
 * claims by medical practitioners. This section is built as briefed, but it is
 * deliberately framed as *how progress is documented* rather than as an
 * advertisement of results.
 *
 * Before any real patient photograph is published the clinic must:
 *   1. hold written, signed, revocable consent naming this specific use;
 *   2. have the section reviewed by its own legal counsel;
 *   3. keep the "results vary" disclaimer visible alongside the images.
 *
 * See README.md § Compliance.
 */

const protocol = [
  {
    Icon: Camera,
    title: "Same angle, every visit",
    detail:
      "Front, crown and parting are photographed from fixed positions so images are genuinely comparable rather than flattering.",
  },
  {
    Icon: Sun,
    title: "Same lighting",
    detail:
      "Consistent, even lighting. Directional light can make identical hair look twice as dense — or half as much.",
  },
  {
    Icon: Ruler,
    title: "Same parting and styling",
    detail:
      "Hair is parted in the same place, dry and unstyled. No product, no arrangement, no camera angle tricks.",
  },
];

export async function BeforeAfter() {
  const results = await getAllResultPairs();
  return (
    <Section id="progress">
      <Container>
        <SectionHeading
          eyebrow="Documenting progress"
          title="How treatment response is actually tracked"
          description="Month to month, nobody can judge their own hair reliably — memory is a poor instrument. Standardised photographs at every follow-up are how progress is assessed honestly, in both directions."
        />

        {/* --------------------------- Comparison --------------------------- */}
        <Reveal className="mt-16">
          <div className="overflow-hidden rounded-5xl bg-platinum p-6 ring-1 ring-line sm:p-10">
            {results.length > 0 ? (
              <ResultPairsGrid pairs={results} />
            ) : (
              <>
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                {
                  label: "First consultation",
                  src: "/images/progress-first-consultation.jpg",
                  alt: "Crown photographed with a digital trichoscope at the first consultation",
                },
                {
                  label: "Follow-up review",
                  src: "/images/progress-follow-up-review.jpg",
                  alt: "Follow-up review comparing the earlier and current crown photographs on screen",
                },
              ].map((image) => (
                <figure key={image.label}>
                  <div className="relative">
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-4xl">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(min-width: 640px) 45vw, 100vw"
                        draggable={false}
                        className="select-none object-cover object-top"
                      />
                    </div>
                    <figcaption className="absolute left-4 top-4 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-teal-800 backdrop-blur-sm">
                      {image.label}
                    </figcaption>
                  </div>
                </figure>
              ))}
            </div>

            {/* Non-negotiable disclaimer — do not remove. */}
            <div className="mt-8 flex gap-3.5 rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6">
              <Info
                className="mt-0.5 size-5 shrink-0 text-olive-600"
                strokeWidth={1.75}
                aria-hidden
              />
              <p className="text-sm leading-relaxed text-muted">
                <span className="font-semibold text-teal-800">
                  Results vary from person to person.
                </span>{" "}
                Photographs are illustrative of how the clinic documents
                treatment, and are published only with the written consent of the
                patient concerned. They are not a prediction or a guarantee of
                any individual outcome. Response depends on the underlying cause,
                how long the condition has been present, and factors outside the
                clinic&rsquo;s control. Some conditions are managed rather than
                resolved, and some do not respond.
              </p>
            </div>
              </>
            )}
          </div>
        </Reveal>

        {/* ---------------------------- Protocol ---------------------------- */}
        <Stagger className="mt-14 grid gap-6 sm:grid-cols-3">
          {protocol.map(({ Icon, title, detail }) => (
            <StaggerItem key={title}>
              <div className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-teal-50 text-olive-600 ring-1 ring-teal-100">
                  <Icon className="size-5" strokeWidth={1.7} aria-hidden />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-teal-800">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">
                    {detail}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
