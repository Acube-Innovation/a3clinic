import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { pageMetadata, breadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/i18n/routing";
import { PageHero } from "@/components/layout/PageHero";
import { Container, Section } from "@/components/ui/Section";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/Reveal";
import { PostCard } from "@/components/blog/PostCard";
import { BookingCta } from "@/components/sections/BookingCta";
import { getPosts, postCategoryLabels, type PostCategory } from "@/data/posts";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/blog">): Promise<Metadata> {
  const { locale } = await params;

  return pageMetadata({
    locale: locale as Locale,
    path: "/blog",
    title: "Clinic Journal — Hair, Skin & Homeopathy",
    description:
      "Evidence-informed articles on hair care, homeopathy, nutrition, women's health and children's health from Dr. Riji's Health Care, Kattakkada.",
  });
}

export default async function BlogPage({
  params,
}: PageProps<"/[locale]/blog">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const posts = await getPosts();
  const [lead, ...rest] = posts;

  // Only show filters for categories that actually have posts.
  const categories = Array.from(
    new Set(posts.map((p) => p.category)),
  ) as PostCategory[];

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([{ name: "Blog", href: "/blog" }], locale as Locale)}
      />

      <PageHero
        eyebrow="Clinic journal"
        title="Straight answers, written for patients"
        description="The same explanations given in the consultation room — about hair, homeopathy, nutrition and health, without the marketing."
        crumbs={[{ name: "Blog", href: "/blog" }]}
      />

      <Section>
        <Container>
          {/* Category chips. Static links today; a filtered route can back them
              later without changing this markup. */}
          <Reveal>
            <ul className="flex flex-wrap gap-2.5">
              <li>
                <span className="inline-flex rounded-full bg-teal-800 px-4 py-2 text-sm font-semibold text-white">
                  All articles
                </span>
              </li>
              {categories.map((category) => (
                <li key={category}>
                  <span className="inline-flex rounded-full bg-platinum px-4 py-2 text-sm font-medium text-muted ring-1 ring-line">
                    {postCategoryLabels[category]}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* ----------------------------- Lead post ---------------------------- */}
          {lead ? (
            <Reveal className="mt-14">
              <div className="overflow-hidden rounded-5xl ring-1 ring-line">
                <div className="grid lg:grid-cols-2">
                  {lead.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={lead.image}
                      alt=""
                      className="aspect-[16/10] w-full object-cover lg:aspect-auto lg:h-full"
                    />
                  ) : (
                    <PlaceholderLead slug={lead.slug} title={lead.title} />
                  )}

                  <div className="flex flex-col justify-center bg-card p-9 sm:p-12">
                    <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-olive-600">
                      {postCategoryLabels[lead.category]}
                    </span>
                    <h2 className="mt-5 text-h2 text-teal-800">{lead.title}</h2>
                    <p className="mt-5 text-lead text-muted">{lead.excerpt}</p>
                    <p className="mt-8 text-sm text-muted">
                      {lead.readingMinutes} min read
                    </p>
                    <LeadLink slug={lead.slug} />
                  </div>
                </div>
              </div>
            </Reveal>
          ) : null}

          {/* ------------------------------- Grid ------------------------------- */}
          <Stagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <StaggerItem key={post.slug} className="h-full">
                <PostCard post={post} />
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      <BookingCta />
    </>
  );
}

/* Local helpers keep the page body readable. */

function PlaceholderLead({ slug, title }: { slug: string; title: string }) {
  return (
    <PlaceholderImage
      slot={`Lead editorial image for article — ${title} (${slug})`}
      variant="editorial"
      rounded="rounded-none"
      className="aspect-[16/10] w-full lg:aspect-auto lg:h-full"
    />
  );
}

function LeadLink({ slug }: { slug: string }) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group mt-6 inline-flex items-center gap-2 self-start text-[0.9375rem] font-semibold text-teal-800 transition-colors hover:text-teal-600"
    >
      Read the article
      <ArrowRight
        aria-hidden
        strokeWidth={2}
        className="size-4 transition-transform duration-300 group-hover:translate-x-1"
      />
    </Link>
  );
}
