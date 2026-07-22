import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { pageMetadata, breadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/i18n/routing";
import { PageHero } from "@/components/layout/PageHero";
import { Container, Section, Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/forms/ContactForm";
import { ClinicLocation } from "@/components/sections/ClinicLocation";
import { phoneIntlOf, phoneDisplayOf, waHrefOf } from "@/lib/site";
import { getClinicSettings } from "@/data/clinic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  const clinic = await getClinicSettings();

  return pageMetadata({
    locale: locale as Locale,
    path: "/contact",
    title: "Contact the Clinic",
    description: `Contact Dr. Riji's Health Care, ${clinic.city}, ${clinic.state}. Call ${phoneDisplayOf(clinic.phone)}, message on WhatsApp, or send an enquiry.`,
  });
}

export default async function ContactPage({
  params,
}: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const clinic = await getClinicSettings();

  const channels = [
    {
      Icon: Phone,
      title: "Call the clinic",
      detail: phoneDisplayOf(clinic.phone),
      description: "Fastest for anything urgent or time-sensitive.",
      href: `tel:${phoneIntlOf(clinic.phone)}`,
      external: false,
    },
    {
      Icon: MessageCircle,
      title: "WhatsApp",
      detail: "Message the clinic",
      description: "Good for quick questions and sharing photographs.",
      href: waHrefOf(clinic.whatsapp, "Hello, I have a question about consultation."),
      external: true,
    },
    {
      Icon: Mail,
      title: "Email",
      detail: clinic.email,
      description: "For product, order and general written enquiries.",
      href: `mailto:${clinic.email}`,
      external: false,
    },
  ];

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema(
          [{ name: "Contact", href: "/contact" }],
          locale as Locale,
        )}
      />

      <PageHero
        eyebrow="Get in touch"
        title="Contact the clinic"
        description="Call for anything urgent. For everything else, WhatsApp and the enquiry form are usually answered within one working day."
        crumbs={[{ name: "Contact", href: "/contact" }]}
      />

      {/* ---------------------------- Channels ----------------------------- */}
      <Section size="sm">
        <Container>
          <div className="grid gap-5 sm:grid-cols-3">
            {channels.map(({ Icon, title, detail, description, href, external }, index) => (
              <Reveal key={title} delay={0.05 * index}>
                <a
                  href={href}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group flex h-full flex-col rounded-4xl bg-card p-7 ring-1 ring-line transition-[transform,box-shadow,ring-color] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-lift hover:ring-teal-100"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-teal-50 text-olive-600 ring-1 ring-teal-100">
                    <Icon className="size-5.5" strokeWidth={1.6} aria-hidden />
                  </span>
                  <h2 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted">
                    {title}
                  </h2>
                  <p className="mt-1.5 text-lg font-semibold text-teal-800 transition-colors group-hover:text-teal-600">
                    {detail}
                  </p>
                  <p className="mt-2.5 flex-1 text-[0.9375rem] leading-relaxed text-muted">
                    {description}
                  </p>
                </a>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------- Form + practical ------------------------- */}
      <Section tone="platinum" size="sm">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
            <div>
              <Reveal>
                <Eyebrow>Enquiry form</Eyebrow>
                <h2 className="mt-6 text-h2 text-teal-800">
                  Send the clinic a message
                </h2>
                <p className="mt-5 text-lead text-muted">
                  For appointments, use the booking page — it captures the
                  details needed to prepare for your consultation.
                </p>
              </Reveal>

              <Reveal delay={0.1} className="mt-10">
                <ContactForm />
              </Reveal>
            </div>

            <div className="lg:sticky lg:top-32 lg:self-start">
              <Reveal delay={0.05}>
                <div className="rounded-4xl bg-white p-8 ring-1 ring-line">
                  <span className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-olive-600">
                    <Clock className="size-5" strokeWidth={1.7} aria-hidden />
                  </span>
                  <h3 className="mt-5 text-h3 text-teal-800">
                    Consultation hours
                  </h3>
                  <ul className="mt-5 flex flex-col gap-2.5">
                    {clinic.hours.map((slot, index) => (
                      <li
                        key={`${slot.days}-${index}`}
                        className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 border-b border-line pb-2.5 text-[0.9375rem] last:border-0 last:pb-0"
                      >
                        <span className="text-muted">{slot.days}</span>
                        <span className="font-medium text-teal-800">
                          {slot.time}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="mt-5 rounded-4xl bg-white p-8 ring-1 ring-line">
                  <span className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-olive-600">
                    <MapPin className="size-5" strokeWidth={1.7} aria-hidden />
                  </span>
                  <h3 className="mt-5 text-h3 text-teal-800">Address</h3>
                  <address className="mt-4 not-italic leading-relaxed text-muted">
                    {clinic.addressLine1}
                    <br />
                    {clinic.addressLine2}
                    <br />
                    {clinic.city}, {clinic.district}
                    <br />
                    {clinic.state} {clinic.postalCode}
                  </address>
                </div>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="mt-5 rounded-4xl bg-teal-900 p-8 text-teal-50">
                  <h3 className="text-lg font-semibold text-white">
                    In an emergency
                  </h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-teal-100/75">
                    This clinic does not provide emergency care. For severe
                    breathing difficulty, chest pain, heavy bleeding, sudden
                    weakness or any life-threatening symptom, go directly to the
                    nearest hospital emergency department.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <ClinicLocation />
    </>
  );
}
