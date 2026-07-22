import { ArrowRight, MessageCircle, Phone } from "lucide-react";

import { Container, Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { phoneIntlOf, phoneDisplayOf, waHrefOf } from "@/lib/site";
import { getClinicSettings } from "@/data/clinic";

export async function BookingCta() {
  const clinic = await getClinicSettings();
  return (
    <Section tone="gradient" id="book-cta" className="overflow-hidden">
      {/* Organic wash + fine grid, so the gradient does not read as flat. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="blob-a absolute -left-24 -top-24 size-[30rem] bg-white/10 blur-3xl" />
        <div className="blob-b absolute -bottom-32 -right-20 size-[26rem] bg-olive-300/15 blur-3xl" />
      </div>

      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-olive-200">
              Start where it makes sense
            </span>
          </Reveal>

          <Reveal delay={0.05}>
            <h2 className="mt-6 text-h1 text-white">
              Book a consultation with Dr. Riji
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-lead text-white/80">
              Online or at the Kattakkada clinic. Bring any reports you already
              have — even the ones you were told were normal.
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="mt-11 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <Button
                href="/book"
                size="lg"
                className="bg-white text-teal-800 hover:bg-olive-50"
              >
                Book consultation
                <ArrowRight
                  aria-hidden
                  strokeWidth={2}
                  className="size-4.5 transition-transform duration-300 group-hover:translate-x-1"
                />
              </Button>

              <Button
                href={waHrefOf(
                  clinic.whatsapp,
                  "Hello, I would like to ask about consultation at Dr. Riji's Health Care.",
                )}
                external
                size="lg"
                variant="onDark"
              >
                <MessageCircle className="size-4.5" strokeWidth={1.9} aria-hidden />
                Ask on WhatsApp
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.22}>
            <a
              href={`tel:${phoneIntlOf(clinic.phone)}`}
              className="mt-10 inline-flex items-center gap-2.5 text-white/75 transition-colors hover:text-white"
            >
              <Phone className="size-4" strokeWidth={1.8} aria-hidden />
              <span>
                Or call{" "}
                <span className="font-semibold text-white">
                  {phoneDisplayOf(clinic.phone)}
                </span>
              </span>
            </a>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
