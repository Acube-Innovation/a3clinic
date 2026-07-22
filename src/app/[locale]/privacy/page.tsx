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
}: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;

  return pageMetadata({
    locale: locale as Locale,
    path: "/privacy",
    title: "Privacy Policy",
    description: `How ${site.name} collects, uses and protects your personal and health information.`,
  });
}

const sections: LegalSection[] = [
  {
    title: "Who we are",
    paragraphs: [
      `${site.name} is a homeopathic clinic operating at ${contact.address.line2}, ${contact.address.city}, ${contact.address.state}. For any question about this policy or your data, contact the clinic at ${contact.email} or ${contact.phoneDisplay}.`,
    ],
  },
  {
    title: "What we collect",
    paragraphs: [
      "We collect two broad categories of information, and we treat them differently.",
    ],
    list: [
      "Contact and booking details — name, phone number, email address, age and gender, plus the appointment you request.",
      "Health information — your medical history, symptoms, blood reports, photographs you upload, prescriptions issued and consultation notes.",
      "Order information — products purchased, delivery address and order history.",
      "Technical information — basic, aggregated analytics about how the website is used. This is not linked to your medical record.",
    ],
  },
  {
    title: "Health information is treated as sensitive",
    paragraphs: [
      "Under India's Digital Personal Data Protection Act 2023, health data is sensitive personal data. It is accessible only to the treating physician and authorised clinic staff, is never sold, and is never shared with advertisers or data brokers.",
      "Photographs you upload for assessment form part of your medical record. They are not published, used in marketing or shown to anyone else without your separate, specific and written consent — and that consent can be withdrawn at any time.",
    ],
  },
  {
    title: "Why we process your information",
    list: [
      "To provide consultation, treatment and follow-up care.",
      "To dispense and deliver medicines and products you order.",
      "To contact you about your appointments and treatment.",
      "To meet the record-keeping obligations that apply to medical practice.",
    ],
  },
  {
    title: "Who we share it with",
    paragraphs: [
      "We share the minimum necessary, and only with:",
    ],
    list: [
      "Courier partners — delivery name and address only, never medical details.",
      "Payment processors — transaction data only. The clinic does not store your card details.",
      "Other healthcare providers — only where you ask us to, or where clinically necessary with your knowledge.",
      "Authorities — only where we are legally required to do so.",
    ],
  },
  {
    title: "How long we keep it",
    paragraphs: [
      "Medical records are retained for the period required of medical practitioners in India, which is longer than the retention period for ordinary customer data. Contact and order information is kept for as long as it is needed for the purpose it was collected for, and for any statutory period that applies afterwards.",
    ],
  },
  {
    title: "Your rights",
    paragraphs: [
      "You may ask for a copy of the personal data we hold about you, ask us to correct anything inaccurate, withdraw a consent you previously gave, or ask us to delete data we are not legally required to keep. Write to us and we will respond within a reasonable period.",
    ],
  },
  {
    title: "Cookies",
    paragraphs: [
      "This website uses only the cookies and local storage needed to make it work — remembering your language and the contents of your cart. We do not use advertising or cross-site tracking cookies.",
    ],
  },
  {
    title: "Changes to this policy",
    paragraphs: [
      "If this policy changes materially, the updated version will be posted here with a revised date.",
    ],
  },
];

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description="How the clinic collects, uses and protects your personal and health information."
        crumbs={[{ name: "Privacy Policy", href: "/privacy" }]}
      />

      <Section>
        <Container>
          <LegalBody
            sections={sections}
            notice="TODO(client): this policy is a well-structured starting point, not legal advice. It must be reviewed by a qualified Indian lawyer against the DPDP Act 2023 and applicable medical record-keeping rules before the site goes live."
          />
        </Container>
      </Section>
    </>
  );
}
