import { ArrowUpRight } from "lucide-react";
import { SiInstagram } from "@icons-pack/react-simple-icons";

import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { social } from "@/lib/site";

/**
 * MOCK: a static grid standing in for the Instagram feed.
 * BACKEND SEAM: replace `tiles` with the Instagram Basic Display API response.
 * Do not embed Instagram's third-party script — it is heavy and it tracks.
 */
const tiles = [
  { slot: "Instagram post — clinic interior detail", caption: "Inside the clinic" },
  { slot: "Instagram post — hair care tip carousel cover", caption: "Hair tip: oiling" },
  { slot: "Instagram post — product flat lay", caption: "Root Revival" },
  { slot: "Instagram reel cover — Dr. Riji answering a question", caption: "Ask the doctor" },
  { slot: "Instagram post — botanical ingredient close-up", caption: "Ingredients" },
  { slot: "Instagram post — Malayalam health tip graphic", caption: "മുടി സംരക്ഷണം" },
];

export function InstagramGallery() {
  return (
    <Section tone="platinum" size="sm" id="instagram">
      <Container>
        <SectionHeading
          eyebrow="Follow along"
          title="@drrijishealthcare"
          description="Hair and skin guidance in English and Malayalam, a few times a week."
        />

        <Stagger className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((tile) => (
            <StaggerItem key={tile.slot}>
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block overflow-hidden rounded-3xl"
                aria-label={`${tile.caption} — view on Instagram`}
              >
                <PlaceholderImage
                  slot={tile.slot}
                  variant="editorial"
                  rounded="rounded-3xl"
                  className="aspect-square w-full transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-110"
                />

                <span
                  aria-hidden
                  className="absolute inset-0 grid place-items-center bg-teal-950/0 opacity-0 transition-all duration-400 group-hover:bg-teal-950/45 group-hover:opacity-100"
                >
                  <SiInstagram size={24} className="text-white" />
                </span>
              </a>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-12 flex justify-center">
          <a
            href={social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3.5 text-[0.9375rem] font-semibold text-teal-800 ring-1 ring-line transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
          >
            <SiInstagram size={18} className="text-olive-600" />
            Follow on Instagram
            <ArrowUpRight
              aria-hidden
              strokeWidth={2}
              className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </div>
      </Container>
    </Section>
  );
}
