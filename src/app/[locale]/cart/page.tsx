import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import { PageHero } from "@/components/layout/PageHero";
import { Container, Section } from "@/components/ui/Section";
import { CartView } from "@/components/shop/CartView";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/cart">): Promise<Metadata> {
  const { locale } = await params;

  return {
    ...pageMetadata({
      locale: locale as Locale,
      path: "/cart",
      title: "Your Cart",
      description: "Review the products in your cart before checkout.",
    }),
    // A personal, session-specific page — keep it out of the index.
    robots: { index: false, follow: true },
  };
}

export default async function CartPage({ params }: PageProps<"/[locale]/cart">) {
  const { locale } = await params;
  setRequestLocale(locale);

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
