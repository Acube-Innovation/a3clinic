import { MessageCircleQuestion } from "lucide-react";

import { Container, Section, Eyebrow } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/seo";
import { getHomeFaqs } from "@/data/faqs";
import { phoneIntlOf, phoneDisplayOf } from "@/lib/site";
import { getClinicSettings } from "@/data/clinic";

export async function FaqSection() {
  const homeFaqs = await getHomeFaqs();
  const clinic = await getClinicSettings();
  return (
    <Section id="faq">
      <JsonLd schema={faqSchema(homeFaqs)} />

      <Container>
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          {/* --------------------------- Sticky aside --------------------------- */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <Eyebrow>Questions</Eyebrow>
            </Reveal>

            <Reveal delay={0.05}>
              <h2 className="mt-6 text-h2 text-teal-800">
                Before you book
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-5 text-lead text-muted">
                The things patients most often want to know, answered plainly.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-10 rounded-4xl bg-platinum p-7 ring-1 ring-line">
                <span className="grid size-11 place-items-center rounded-2xl bg-white text-olive-600 ring-1 ring-line">
                  <MessageCircleQuestion
                    className="size-5"
                    strokeWidth={1.7}
                    aria-hidden
                  />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-teal-800">
                  Still unsure?
                </h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
                  Call the clinic and ask before booking. It is a reasonable
                  thing to want.
                </p>
                <Button
                  href={`tel:${phoneIntlOf(clinic.phone)}`}
                  variant="secondary"
                  className="mt-5 w-full"
                >
                  {phoneDisplayOf(clinic.phone)}
                </Button>
              </div>
            </Reveal>
          </div>

          {/* ----------------------------- Accordion ---------------------------- */}
          <Reveal delay={0.1}>
            <Accordion items={homeFaqs} />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
