
import { PageHero } from "@/components/layout/PageHero";
import { Container, Section } from "@/components/ui/Section";
import { CartView } from "@/components/shop/CartView";

export default function CartPage() {
  return (
    <>
      <PageHero
        eyebrow="Cart"
        title="Your cart"
        crumbs={[{ name: "Cart", href: "/cart" }]}
      />

      <Section>
        <Container>
          <CartView />
        </Container>
      </Section>
    </>
  );
}
