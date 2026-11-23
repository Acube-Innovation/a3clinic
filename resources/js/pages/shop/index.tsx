import { Suspense } from "react";
import { Leaf, PackageCheck, Truck } from "lucide-react";

import { PageHero } from "@/components/layout/PageHero";
import { Container, Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { ShopBrowser } from "@/components/shop/ShopBrowser";
import { ProductsStory } from "@/components/sections/ProductsStory";
import { BookingCta } from "@/components/sections/BookingCta";
import type { Product, ProductCategory } from "@/data/products";

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

export default function ShopPage({
  products,
  categories,
}: {
  products: Product[];
  categories: ProductCategory[];
}) {

  return (
    <>

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
