import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import { PageHero } from "@/components/layout/PageHero";
import { Container, Section } from "@/components/ui/Section";
import { LegalBody, type LegalSection } from "@/components/legal/LegalBody";
import { contact, site } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/terms">): Promise<Metadata> {
  const { locale } = await params;

  return pageMetadata({
    locale: locale as Locale,
    path: "/terms",
    title: "Terms of Service",
    description: `The terms on which ${site.name} provides consultation, products and this website.`,
  });
}

const sections: LegalSection[] = [
  {
    title: "Medical disclaimer",
    paragraphs: [
      "The information on this website is provided for general education. It is not medical advice, it cannot account for your individual history, and it must not be used to diagnose or treat any condition.",
      "Homeopathic treatment provided by this clinic complements conventional medical care. It does not replace it. Do not stop, reduce or alter any medication prescribed by another doctor without first speaking to that doctor.",
      "In a medical emergency — including severe breathing difficulty, chest pain, heavy bleeding, sudden weakness, or a fever that will not come down — go directly to the nearest hospital emergency department. Do not wait for a consultation.",
    ],
  },
  {
    title: "No guarantee of outcome",
    paragraphs: [
      "Treatment response varies from person to person and depends on the underlying cause, how long the condition has been present, adherence to the treatment plan, and factors outside the clinic's control. No specific result is promised or guaranteed. Any timelines described on this website are indicative only.",
    ],
  },
  {
    title: "Consultations",
    list: [
      "Appointments are confirmed by the clinic after you submit a request; submitting a request does not by itself reserve a slot.",
      "Please provide accurate and complete health information. A consultation is only as reliable as the history it is based on.",
      "Where a case requires physical examination, you will be asked to attend the clinic in person rather than be treated remotely.",
      "Consultation fees, and any cancellation or rescheduling terms, are as notified at the time of booking.",
    ],
  },
  {
    title: "Products",
    paragraphs: [
      "Hair and skin products sold through this website are cosmetic preparations. They are not medicines, they are not intended to diagnose, treat or cure any condition, and they are not a substitute for consultation.",
      "Prescription and dispensed homeopathic preparations are available only to patients who have completed a consultation, and are supplied against an individual prescription.",
      "Always read the safety information on the product page. Patch test before first use, and stop using anything that causes irritation.",
    ],
  },
  {
    title: "Orders, delivery and returns",
    list: [
      "Prices are in Indian Rupees and include applicable taxes unless stated otherwise.",
      "Delivery timelines are estimates and are not guaranteed.",
      "For reasons of hygiene and safety, opened cosmetic products and any dispensed medicine cannot be returned.",
      "If an item arrives damaged or incorrect, contact the clinic within 48 hours of delivery and it will be put right.",
    ],
  },
  {
    title: "Use of this website",
    paragraphs: [
      "You may use this website for personal, non-commercial purposes. Content, text, images and branding remain the property of the clinic and may not be copied or republished without permission.",
      "The clinic aims to keep information accurate and current but does not warrant that the website will be uninterrupted or error-free.",
    ],
  },
  {
    title: "Limitation of liability",
    paragraphs: [
      "To the extent permitted by law, the clinic is not liable for any loss arising from reliance on general information published on this website, as distinct from advice given to you personally in a consultation.",
    ],
  },
  {
    title: "Governing law",
    paragraphs: [
      `These terms are governed by the laws of India, and the courts at Thiruvananthapuram, Kerala have jurisdiction. Questions about these terms may be sent to ${contact.email}.`,
    ],
  },
];

export default async function TermsPage({
  params,
}: PageProps<"/[locale]/terms">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        description="The terms on which the clinic provides consultation, products and this website."
        crumbs={[{ name: "Terms of Service", href: "/terms" }]}
      />

      <Section>
        <Container>
          <LegalBody
            sections={sections}
            notice="TODO(client): these terms are a structured starting point, not legal advice. They must be reviewed by a qualified Indian lawyer — particularly the medical disclaimer, the product classification and the returns policy — before the site goes live."
          />
        </Container>
      </Section>
    </>
  );
}
