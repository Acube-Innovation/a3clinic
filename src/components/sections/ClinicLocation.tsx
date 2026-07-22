import { Clock, MapPin, Navigation, Phone } from "lucide-react";

import { Container, Section, Eyebrow } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { phoneIntlOf, phoneDisplayOf } from "@/lib/site";
import { getClinicSettings } from "@/data/clinic";

export async function ClinicLocation() {
  const clinic = await getClinicSettings();
  const query = encodeURIComponent(
    clinic.mapQuery ||
      `${clinic.addressLine1}, ${clinic.addressLine2}, ${clinic.city}, ${clinic.state} ${clinic.postalCode}`,
  );

  return (
    <Section id="location">
      <Container>
        <div className="overflow-hidden rounded-6xl ring-1 ring-line">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            {/* ----------------------------- Details ---------------------------- */}
            <div className="bg-card px-8 py-12 sm:px-12 sm:py-14">
              <Reveal>
                <Eyebrow>Visit the clinic</Eyebrow>
              </Reveal>

              <Reveal delay={0.05}>
                <h2 className="mt-6 text-h2 text-teal-800">
                  Kattakkada, Thiruvananthapuram
                </h2>
              </Reveal>

              <dl className="mt-10 flex flex-col gap-8">
                <Reveal delay={0.1}>
                  <dt className="flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wider text-olive-600">
                    <MapPin className="size-4" strokeWidth={1.8} aria-hidden />
                    Address
                  </dt>
                  <dd className="mt-2.5 pl-6.5 not-italic leading-relaxed text-muted">
                    <address className="not-italic">
                      {clinic.addressLine1}
                      <br />
                      {clinic.addressLine2}
                      <br />
                      {clinic.city}, {clinic.district}
                      <br />
                      {clinic.state} {clinic.postalCode}
                    </address>
                  </dd>
                </Reveal>

                <Reveal delay={0.14}>
                  <dt className="flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wider text-olive-600">
                    <Clock className="size-4" strokeWidth={1.8} aria-hidden />
                    Consultation hours
                  </dt>
                  <dd className="mt-2.5 pl-6.5">
                    <ul className="flex flex-col gap-2">
                      {clinic.hours.map((slot, index) => (
                        <li
                          key={`${slot.days}-${index}`}
                          className="flex flex-wrap justify-between gap-x-6 gap-y-0.5 border-b border-line pb-2 text-[0.9375rem] last:border-0"
                        >
                          <span className="text-ink/80">{slot.days}</span>
                          <span className="font-medium text-teal-800">
                            {slot.time}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </Reveal>

                <Reveal delay={0.18}>
                  <dt className="flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wider text-olive-600">
                    <Phone className="size-4" strokeWidth={1.8} aria-hidden />
                    Phone
                  </dt>
                  <dd className="mt-2.5 pl-6.5">
                    <a
                      href={`tel:${phoneIntlOf(clinic.phone)}`}
                      className="text-lg font-medium text-teal-800 transition-colors hover:text-teal-600"
                    >
                      {phoneDisplayOf(clinic.phone)}
                    </a>
                  </dd>
                </Reveal>
              </dl>

              <Reveal delay={0.22}>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <Button href="/book" size="lg">
                    Book appointment
                  </Button>
                  <Button
                    href={`https://www.google.com/maps/search/?api=1&query=${query}`}
                    external
                    variant="secondary"
                    size="lg"
                  >
                    <Navigation className="size-4" strokeWidth={2} aria-hidden />
                    Get directions
                  </Button>
                </div>
              </Reveal>
            </div>

            {/* ------------------------------- Map ------------------------------ */}
            <div className="relative min-h-[24rem] bg-platinum lg:min-h-[34rem]">
              {/*
                Google's no-API-key embed. It geocodes the query string at load.
                TODO(client): replace with a Maps Embed API key and the clinic's
                exact place ID once available, for a reliable pin.
              */}
              <iframe
                title="Map showing the location of Dr. Riji's Health Care in Kattakkada"
                src={`https://maps.google.com/maps?q=${query}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0 grayscale-[0.35] contrast-[1.05]"
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
