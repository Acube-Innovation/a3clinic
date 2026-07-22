import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CircleAlert } from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import { PageHero } from "@/components/layout/PageHero";
import { Container, Section } from "@/components/ui/Section";
import { PortalDashboard } from "@/components/portal/PortalDashboard";
import { patient } from "@/data/portal";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/portal">): Promise<Metadata> {
  const { locale } = await params;

  return {
    ...pageMetadata({
      locale: locale as Locale,
      path: "/portal",
      title: "Patient Portal",
      description:
        "View your appointments, prescriptions, orders, reports and invoices.",
    }),
    // Never index a page that will hold personal health information.
    robots: { index: false, follow: false },
  };
}

export default async function PortalPage({
  params,
}: PageProps<"/[locale]/portal">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHero
        eyebrow="Patient portal"
        title={`Welcome back, ${patient.name}`}
        description={`Patient ID ${patient.id} · with the clinic since ${formatDate(patient.since)}`}
        crumbs={[{ name: "Patient Portal", href: "/portal" }]}
      />

      <Section>
        <Container>
          {/*
            Deliberately explicit rather than a fake login screen. Shipping a
            login form that authenticates nothing teaches users the wrong thing
            about what is protected.
          */}
          <div className="mb-12 flex gap-4 rounded-4xl bg-olive-50 p-6 ring-1 ring-olive-200 sm:p-7">
            <CircleAlert
              className="mt-0.5 size-5 shrink-0 text-olive-700"
              strokeWidth={1.9}
              aria-hidden
            />
            <div>
              <h2 className="font-semibold text-olive-900">
                Demonstration only — not a real patient record
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-olive-800">
                This preview shows the portal layout using sample data. There is
                no sign-in, no real record, and nothing here belongs to an actual
                patient. In the live clinic the portal sits behind
                authentication, and medical records are health data subject to
                access control, audit logging and India&rsquo;s DPDP Act 2023.
              </p>
            </div>
          </div>

          <PortalDashboard />
        </Container>
      </Section>
    </>
  );
}
