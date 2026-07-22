import { Quote } from "lucide-react";

import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { getTestimonials } from "@/data/testimonials";

/**
 * ⚠️ COMPLIANCE: patient testimonials are restricted for medical practitioners
 * in India. Quotes here describe the experience of care rather than claiming
 * outcomes. Written consent is required for every real quote published.
 * See README.md § Compliance and src/data/testimonials.ts.
 */
export async function Testimonials() {
  const testimonials = await getTestimonials();

  return (
    <Section tone="platinum" id="testimonials">
      <Container>
        <SectionHeading
          eyebrow="In patients' words"
          title="What consulting here is actually like"
          description="Shared with permission, and edited only for length."
        />

        <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <StaggerItem key={testimonial.id} className="h-full">
              <figure className="flex h-full flex-col rounded-4xl bg-card p-8 ring-1 ring-line transition-[transform,box-shadow] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-lift">
                <Quote
                  className="size-7 shrink-0 text-olive-300"
                  strokeWidth={1.5}
                  aria-hidden
                />

                <blockquote className="mt-5 flex-1">
                  <p className="leading-relaxed text-ink/85">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </blockquote>

                <figcaption className="mt-7 border-t border-line pt-5">
                  <p className="font-semibold text-teal-800">
                    {testimonial.author}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {testimonial.location}
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wider text-olive-600">
                    {testimonial.context}
                  </p>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>

        <p className="mx-auto mt-12 max-w-3xl text-center text-sm leading-relaxed text-muted">
          Individual experiences are personal to the patient and are not a
          prediction of any other person&rsquo;s outcome. Treatment response
          varies with the underlying cause, how long the condition has been
          present, and factors outside the clinic&rsquo;s control.
        </p>
      </Container>
    </Section>
  );
}
