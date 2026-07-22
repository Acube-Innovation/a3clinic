import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { pageMetadata, breadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/i18n/routing";
import { PageHero } from "@/components/layout/PageHero";
import { Container, Section } from "@/components/ui/Section";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { getClinicSettings } from "@/data/clinic";
import { phoneIntlOf, phoneDisplayOf } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/book">): Promise<Metadata> {
  const { locale } = await params;

  return pageMetadata({
    locale: locale as Locale,
    path: "/book",
    title: "Book an Appointment",
    description:
      "Book an online video consultation or an in-person appointment at the Kattakkada clinic with Dr. Riji Rasheed (BHMS).",
  });
}

export default async function BookPage({ params }: PageProps<"/[locale]/book">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const clinic = await getClinicSettings();
  const phone = {
    intl: phoneIntlOf(clinic.phone),
    display: phoneDisplayOf(clinic.phone),
  };

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema(
          [{ name: "Book Appointment", href: "/book" }],
          locale as Locale,
        )}
      />

      <PageHero
        eyebrow="Booking"
        title="Book your consultation"
        description="Six short steps. You will receive a WhatsApp confirmation once the clinic has checked the slot."
        crumbs={[{ name: "Book Appointment", href: "/book" }]}
        align="center"
      />

      <Section>
        <Container>
          <BookingWizard phone={phone} />
        </Container>
      </Section>
    </>
  );
}
