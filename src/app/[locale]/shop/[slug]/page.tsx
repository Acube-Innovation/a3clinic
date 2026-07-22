import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { routing, type Locale } from "@/i18n/routing";
import { pageMetadata, breadcrumbSchema, productSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container, Section } from "@/components/ui/Section";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { ProductCard } from "@/components/shop/ProductCard";
import { BookingCta } from "@/components/sections/BookingCta";
import {
  getProductBySlug,
  getProducts,
  getRelatedProducts,
  categoryLabels,
} from "@/data/products";

export async function generateStaticParams() {
  const products = await getProducts();
  return routing.locales.flatMap((locale) =>
    products.map((product) => ({ locale, slug: product.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/shop/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return {};

  return pageMetadata({
    locale: locale as Locale,
    path: `/shop/${product.slug}`,
    title: `${product.name} — ${product.size}`,
    description: product.tagline,
  });
}

export default async function ProductPage({
  params,
}: PageProps<"/[locale]/shop/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(slug);

  const crumbs = [
    { name: "Shop", href: "/shop" },
    { name: product.name, href: `/shop/${product.slug}` },
  ];

  return (
    <>
      <JsonLd
        schema={[
          productSchema({
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            image: product.image,
            inStock: product.inStock,
            rating: {
              value: product.rating.value,
              count: product.rating.count,
            },
          }),
          breadcrumbSchema(crumbs, locale as Locale),
        ]}
      />

      <Section size="sm" className="pt-32 sm:pt-36">
        <Container>
          <Breadcrumbs crumbs={crumbs} className="mb-10" />
          <p className="mb-3 text-eyebrow font-semibold uppercase tracking-[0.16em] text-olive-600">
            {categoryLabels[product.category]}
          </p>
          <ProductDetail product={product} />
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section tone="platinum">
          <Container>
            <div className="flex items-baseline gap-5">
              <h2 className="text-h3 text-teal-800">Pairs well with</h2>
              <span aria-hidden className="rule-olive flex-1" />
            </div>

            <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <StaggerItem key={item.slug} className="h-full">
                  <ProductCard product={item} />
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </Section>
      ) : null}

      <BookingCta />
    </>
  );
}
