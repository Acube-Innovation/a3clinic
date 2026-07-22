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
                <div className="group relative h-full overflow-hidden rounded-4xl bg-white/5 p-8 ring-1 ring-white/10 transition-[transform,background-color,ring-color] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:bg-white/10 hover:ring-white/20">
                  {/* Oversized step number as a watermark */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-2 -top-6 font-display text-8xl leading-none text-white/5 transition-colors duration-500 group-hover:text-white/[0.08]"
                  >
                    {step.step}
                  </span>

                  <span className="relative grid size-12 place-items-center rounded-2xl bg-white/10 text-olive-300 ring-1 ring-white/15">
                    <Icon className="size-5.5" strokeWidth={1.6} aria-hidden />
                  </span>

                  <h3 className="relative mt-6 text-xl font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="relative mt-3 leading-relaxed text-teal-100/70">
                    {step.detail}
                  </p>
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
