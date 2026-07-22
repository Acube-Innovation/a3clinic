import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";

import { routing } from "@/i18n/routing";
import { getConditions } from "@/data/conditions";
import { getClinicSettings } from "@/data/clinic";
import { site, phoneIntlOf, phoneDisplayOf, waHrefOf } from "@/lib/site";
import { medicalClinicSchema, physicianSchema, websiteSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingActions } from "@/components/layout/FloatingActions";

import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Homeopathy for Hair, Skin & Whole-body Wellness`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: "Dr. Riji Rasheed" }],
  creator: site.name,
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

export const viewport = {
  themeColor: "#044B4D",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  // Next 16: params is a Promise. The synchronous compatibility shim from 15
  // was removed, so this await is mandatory.
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Required before any next-intl call for static rendering to work.
  setRequestLocale(locale);

  const t = await getTranslations("nav");

  // The header's Treatments dropdown is data-driven: every condition marked
  // "Featured" in the admin panel appears here, framed by the programme link
  // and the full index. Saving in the admin revalidates this layout.
  const [conditions, clinic] = await Promise.all([
    getConditions(),
    getClinicSettings(),
  ]);
  const phone = {
    intl: phoneIntlOf(clinic.phone),
    display: phoneDisplayOf(clinic.phone),
  };
  const whatsappHref = waHrefOf(
    clinic.whatsapp,
    "Hello Dr. Riji's Health Care, I would like to book a consultation.",
  );

  const treatmentsMenu = [
    { label: t("hairTreatment"), href: "/hair-treatment" },
    ...conditions
      .filter((condition) => condition.featured)
      .map((condition) => ({
        label: condition.name,
        href: `/conditions/${condition.slug}`,
      })),
    { label: t("allConditions"), href: "/conditions" },
  ];

  return (
    <html
      lang={locale}
      // Next 16 stopped forcing smooth scroll on navigation; this opts back in.
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white">
        {/*
          Scroll-reveal wrappers are server-rendered at opacity:0 and animated
          in by JS. Without this fallback, a visitor whose JS is blocked or
          fails would see empty sections. Content must never depend on an
          animation having run.
        */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>

        <JsonLd
          schema={[
            websiteSchema(),
            medicalClinicSchema(clinic),
            physicianSchema(clinic),
          ]}
        />

        <a
          href="#main"
          className="sr-only rounded-full bg-teal-800 px-5 py-3 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
        >
          {t("skipToContent")}
        </a>

        <NextIntlClientProvider>
          <CartProvider>
            <Header treatments={treatmentsMenu} phone={phone} whatsappHref={whatsappHref} />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
            <FloatingActions whatsappHref={whatsappHref} />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
