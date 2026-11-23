
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container, Section } from "@/components/ui/Section";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { ProductCard } from "@/components/shop/ProductCard";
import { BookingCta } from "@/components/sections/BookingCta";
import {
  categoryLabels,
  type Product,
} from "@/data/products";

export default function ProductPage({ product, related }: { product: Product; related: Product[] }) {

  const crumbs = [
    { name: "Shop", href: "/shop" },
    { name: product.name, href: `/shop/${product.slug}` },
  ];

  return (
    <>

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
