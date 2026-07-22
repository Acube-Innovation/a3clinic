import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

import { Hero } from "@/components/sections/Hero";
import { WhyChoose } from "@/components/sections/WhyChoose";
import { HairSpeciality } from "@/components/sections/HairSpeciality";
import { ConditionsTreated } from "@/components/sections/ConditionsTreated";
import { ConsultationProcess } from "@/components/sections/ConsultationProcess";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { ProductsStory } from "@/components/sections/ProductsStory";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { Testimonials } from "@/components/sections/Testimonials";
import { VideoConsultation } from "@/components/sections/VideoConsultation";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { FaqSection } from "@/components/sections/FaqSection";
import { InstagramGallery } from "@/components/sections/InstagramGallery";
import { ClinicLocation } from "@/components/sections/ClinicLocation";
import { BookingCta } from "@/components/sections/BookingCta";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;

  return pageMetadata({
    locale: locale as Locale,
    path: "/",
    title:
      "Homeopathy for Hair, Skin & Whole-body Wellness in Kattakkada, Kerala",
    description:
      "Consult Dr. Riji Rasheed (BHMS) online or at the Kattakkada clinic for homeopathic treatment of hair fall, alopecia, dandruff, skin conditions, thyroid, PCOD and more.",
  });
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <WhyChoose />
      <HairSpeciality />
      <ConditionsTreated />
      <ConsultationProcess />
      <BeforeAfter />
      <ProductsStory />
      <FeaturedProducts />
      <Testimonials />
      <VideoConsultation />
      <BlogPreview />
      <FaqSection />
      <InstagramGallery />
      <ClinicLocation />
      <BookingCta />
    </>
  );
}
