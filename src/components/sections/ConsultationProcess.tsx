import Image from "next/image";
import {
  CalendarDays,
  FileText,
  Package,
  RefreshCw,
  Upload,
  Video,
  type LucideIcon,
} from "lucide-react";

import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { consultationSteps } from "@/data/faqs";

// Icon names live as strings in the data module so it stays serialisable; the
// mapping to components is a presentation concern and belongs here.
const icons: Record<string, LucideIcon> = {
  calendar: CalendarDays,
  upload: Upload,
  video: Video,
  file: FileText,
  package: Package,
  refresh: RefreshCw,
};

// Photo per step, keyed by step number. Step 05 uses a crop of the reception
// photo (clinic-medicine-shelves.jpg) showing the dispensary shelves.
const photos: Record<string, { src: string; alt: string; position: string }> = {
  "01": { src: "/images/hero-clinic.jpg", alt: "Reception desk at the Kattakkada clinic", position: "object-center" },
  "02": { src: "/images/consultation-history.jpg", alt: "Doctor taking a patient's history", position: "object-[48%_center]" },
  "03": { src: "/images/doctor-portrait.jpg", alt: "Dr. Riji Rasheed at her consulting desk", position: "object-[center_25%]" },
  "04": { src: "/images/individual-prescription.jpg", alt: "Doctor explaining prescribed medicines to a patient", position: "object-[center_55%]" },
  "05": { src: "/images/clinic-medicine-shelves.jpg", alt: "Shelves of the clinic's medicines ready for dispatch", position: "object-center" },
  "06": { src: "/images/trichoscopy-examination.jpg", alt: "Follow-up scalp examination with a digital trichoscope", position: "object-[57%_35%]" },
};

export function ConsultationProcess() {
  return (
    <Section tone="teal" id="consultation-process" className="overflow-hidden">
      {/* Soft radial wash so the flat teal does not read as a solid block. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(122,152,51,0.18),transparent_60%)]"
      />

      <Container>
        <SectionHeading
          tone="dark"
          eyebrow="How online consultation works"
          title="Six steps, from booking to follow-up"
          description="The process is identical whether you consult from Kattakkada or from abroad. Reports are reviewed before the call, and medicines reach you afterwards."
        />

        <Stagger className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {consultationSteps.map((step) => {
            const Icon = icons[step.icon];
            return (
              <StaggerItem key={step.step}>
                <div className="group relative flex h-full flex-col overflow-hidden rounded-4xl bg-white/5 ring-1 ring-white/10 transition-[transform,background-color,ring-color] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:bg-white/10 hover:ring-white/20">
                  {/* Top half: photo, fading into the card's green */}
                  <div className="relative h-52 shrink-0 overflow-hidden">
                    <Image
                      src={photos[step.step].src}
                      alt={photos[step.step].alt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className={`object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-105 ${photos[step.step].position}`}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-teal-900/70"
                    />

                    {/* Icon tile sits on the photo; blurred tint keeps it legible */}
                    <span className="absolute bottom-5 left-8 grid size-12 place-items-center rounded-2xl bg-teal-900/60 text-olive-300 ring-1 ring-white/20 backdrop-blur-md">
                      <Icon className="size-5.5" strokeWidth={1.6} aria-hidden />
                    </span>
                  </div>

                  {/* Bottom half: content */}
                  <div className="relative flex-1 px-8 pb-8 pt-6">
                    {/* Oversized step number as a watermark */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -bottom-4 -right-2 font-display text-8xl leading-none text-white/5 transition-colors duration-500 group-hover:text-white/[0.08]"
                    >
                      {step.step}
                    </span>

                    <h3 className="relative text-xl font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="relative mt-3 leading-relaxed text-teal-100/70">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        <div className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button href="/book" size="lg" variant="olive">
            Book your consultation
          </Button>
          <Button href="/consultation" size="lg" variant="onDark">
            Read the full process
          </Button>
        </div>
      </Container>
    </Section>
  );
}
