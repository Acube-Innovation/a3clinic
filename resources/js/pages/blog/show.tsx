import { Clock, Info } from "lucide-react";

import { PageHero } from "@/components/layout/PageHero";
import { Container, Section } from "@/components/ui/Section";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { PostCard } from "@/components/blog/PostCard";
import { BookingCta } from "@/components/sections/BookingCta";
import { formatDate } from "@/lib/utils";
import { doctor } from "@/lib/site";
import {
  postCategoryLabels,
  type Block,
  type Post,
} from "@/data/posts";

/** Renders one authored content block. Keeps the page body declarative. */
function ContentBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="mt-14 text-h3 text-teal-800 first:mt-0">{block.text}</h2>
      );

    case "paragraph":
      return (
        <p className="mt-6 text-lead leading-relaxed text-ink/80">
          {block.text}
        </p>
      );

    case "list":
      return (
        <ul className="mt-7 flex flex-col gap-4">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3.5">
              <span
                aria-hidden
                className="mt-2.5 size-1.5 shrink-0 rounded-full bg-olive-500"
              />
              <span className="leading-relaxed text-muted">{item}</span>
            </li>
          ))}
        </ul>
      );

    case "callout":
      return (
        <aside className="mt-10 flex gap-4 rounded-4xl bg-platinum p-6 ring-1 ring-line sm:p-7">
          <Info
            className="mt-0.5 size-5 shrink-0 text-olive-600"
            strokeWidth={1.75}
            aria-hidden
          />
          <p className="leading-relaxed text-ink/80">{block.text}</p>
        </aside>
      );
  }
}

export default function BlogPostPage({ post, related }: { post: Post; related: Post[] }) {

  const crumbs = [
    { name: "Blog", href: "/blog" },
    { name: post.title, href: `/blog/${post.slug}` },
  ];

  return (
    <>

      <PageHero
        eyebrow={postCategoryLabels[post.category]}
        title={post.title}
        description={post.excerpt}
        crumbs={crumbs}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
          <span className="font-medium text-teal-800">
            {doctor.name}, {doctor.credentials}
          </span>
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" strokeWidth={1.75} aria-hidden />
            {post.readingMinutes} min read
          </span>
        </div>
      </PageHero>

      <Section>
        <Container>
          <Reveal className="mx-auto max-w-4xl">
            {post.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.image}
                alt=""
                className="aspect-[16/9] w-full rounded-5xl object-cover ring-1 ring-line"
              />
            ) : (
              <PlaceholderImage
                slot={`Hero image for article — ${post.title}`}
                variant="editorial"
                rounded="rounded-5xl"
                className="aspect-[16/9] w-full"
              />
            )}
          </Reveal>

          <article className="mx-auto mt-16 max-w-3xl">
            {post.body.map((block, index) => (
              <Reveal key={index}>
                <ContentBlock block={block} />
              </Reveal>
            ))}
          </article>

          {/* Medical disclaimer — required on every clinical article. */}
          <Reveal className="mx-auto mt-16 max-w-3xl">
            <div className="rounded-4xl bg-teal-900 p-8 text-teal-50">
              <p className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-olive-300">
                Please note
              </p>
              <p className="mt-4 leading-relaxed text-teal-100/80">
                This article is general education, not medical advice, and it
                cannot account for your individual history. It should not be used
                to self-diagnose or self-treat. Homeopathic treatment works
                alongside conventional medicine — never stop or change a
                medication prescribed by another doctor without speaking to that
                doctor first. If your symptoms are severe or worsening, seek
                medical care promptly.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section tone="platinum">
          <Container>
            <div className="flex items-baseline gap-5">
              <h2 className="text-h3 text-teal-800">Continue reading</h2>
              <span aria-hidden className="rule-olive flex-1" />
            </div>

            <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <StaggerItem key={item.slug} className="h-full">
                  <PostCard post={item} />
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
