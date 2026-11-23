import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { BookingCta } from "@/components/sections/BookingCta";
import { ClinicLocation } from "@/components/sections/ClinicLocation";
import { ConditionsTreated } from "@/components/sections/ConditionsTreated";
import { ConsultationProcess } from "@/components/sections/ConsultationProcess";
import { FaqSection } from "@/components/sections/FaqSection";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { HairSpeciality } from "@/components/sections/HairSpeciality";
import { Hero } from "@/components/sections/Hero";
import { InstagramGallery } from "@/components/sections/InstagramGallery";
import { ProductsStory } from "@/components/sections/ProductsStory";
import { Testimonials } from "@/components/sections/Testimonials";
import { VideoConsultation } from "@/components/sections/VideoConsultation";
import { WhyChoose } from "@/components/sections/WhyChoose";
import type { ConditionCard, ResultPair } from "@/data/conditions";
import type { Faq } from "@/data/faqs";
import type { Post } from "@/data/posts";
import type { Product } from "@/data/products";
import type { Testimonial } from "@/data/testimonials";

type Props = {
  conditions: ConditionCard[];
  resultPairs: ResultPair[];
  featuredProducts: Product[];
  testimonials: Testimonial[];
  recentPosts: Post[];
  faqs: Faq[];
};

export default function HomePage({
  conditions,
  resultPairs,
  featuredProducts,
  testimonials,
  recentPosts,
  faqs,
}: Props) {
  return (
    <>
      <Hero />
      <WhyChoose />
      <HairSpeciality />
      <ConditionsTreated conditions={conditions} />
      <ConsultationProcess />
      <BeforeAfter results={resultPairs} />
      <ProductsStory />
      <FeaturedProducts products={featuredProducts} />
      <Testimonials testimonials={testimonials} />
      <VideoConsultation />
      <BlogPreview posts={recentPosts} />
      <FaqSection faqs={faqs} />
      <InstagramGallery />
      <ClinicLocation />
      <BookingCta />
    </>
  );
}
