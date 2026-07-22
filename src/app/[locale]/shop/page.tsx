import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { Leaf, PackageCheck, Truck } from "lucide-react";

import { pageMetadata, breadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/i18n/routing";
import { PageHero } from "@/components/layout/PageHero";
import { Container, Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { ShopBrowser } from "@/components/shop/ShopBrowser";
import { ProductsStory } from "@/components/sections/ProductsStory";
import { BookingCta } from "@/components/sections/BookingCta";
import { getProducts, getActiveCategories } from "@/data/products";

const assurances = [
  {
    Icon: Leaf,
    title: "Doctor formulated",
    detail: "Developed in the clinic, with full ingredient lists published.",
  },
  {
    Icon: Truck,
    title: "Delivered across India",
    detail: "Two to three days within Kerala, four to six elsewhere.",
  },
  {
    Icon: PackageCheck,
    title: "Cosmetic, not curative",
    detail: "These support treatment. They are not sold as cures.",
  },
];

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/shop">): Promise<Metadata> {
  const { locale } = await params;

  return pageMetadata({
    locale: locale as Locale,
    path: "/shop",
    title: "Shop — Doctor Formulated Hair & Skin Care",
    description:
      "Hair oil, scalp serum, shampoo, conditioner and skin care formulated by Dr. Riji Rasheed (BHMS). Full ingredient lists, no mineral oil, no added fragrance.",
  });
}

export default async function ShopPage({
  params,
}: PageProps<"/[locale]/shop">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [products, categories] = await Promise.all([
    getProducts(),
    getActiveCategories(),
  ]);

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([{ name: "Shop", href: "/shop" }], locale as Locale)}
      />

      <PageHero
        eyebrow="The range"
        title="Doctor formulated hair &amp; skin care"
        // Count is derived so the copy cannot drift from the catalogue.
        description={`${products.length} products across hair and skin care, built around one complete routine. Small by design — every formulation is one Dr. Riji is willing to recommend at a consultation.`}
        crumbs={[{ name: "Shop", href: "/shop" }]}
      />

      {/* --------------------------- Assurances ---------------------------- */}
      <Section size="sm" className="!pb-0">
        <Container>
          <div className="grid gap-5 sm:grid-cols-3">
            {assurances.map(({ Icon, title, detail }, index) => (
              <Reveal key={title} delay={0.05 * index}>
                <div className="flex gap-4 rounded-4xl bg-platinum p-6 ring-1 ring-line">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-olive-600">
                    <Icon className="size-5" strokeWidth={1.7} aria-hidden />
                  </span>
                  <div>
                    <h2 className="font-semibold text-teal-800">{title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {detail}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ----------------------------- Browser ----------------------------- */}
      <Section>
        <Container>
          <Suspense
            fallback={
              <div className="h-96 animate-pulse rounded-5xl bg-platinum" />
            }
          >
            <ShopBrowser products={products} categories={categories} />
          </Suspense>
        </Container>
      </Section>

      <ProductsStory />
      <BookingCta />
    </>
  );
}
