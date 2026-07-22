import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/shop/ProductCard";
import { getFeaturedProducts } from "@/data/products";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return (
    <Section id="featured-products">
      <Container>
        <SectionHeading
          eyebrow="Featured products"
          title="The clinic routine"
          description="Four products, correctly sequenced. Most patients start with the kit, then reorder individual items as they run out."
        />

        <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <StaggerItem key={product.slug} className="h-full">
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-14 flex justify-center">
          <Button href="/shop" variant="secondary" size="lg">
            View all products
          </Button>
        </div>
      </Container>
    </Section>
  );
}
