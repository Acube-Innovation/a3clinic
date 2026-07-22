import { Clock } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { formatDate } from "@/lib/utils";
import { postCategoryLabels, type Post } from "@/data/posts";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-4xl bg-card ring-1 ring-line transition-[transform,box-shadow,ring-color] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-lift hover:ring-teal-100">
      <div className="overflow-hidden">
        {post.image ? (
          // Admin upload served from our /uploads route.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image}
            alt=""
            loading="lazy"
            className="aspect-[16/10] w-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.05]"
          />
        ) : (
          <PlaceholderImage
            slot={`Editorial image for article — ${post.title}`}
            variant="editorial"
            rounded="rounded-none"
            className="aspect-[16/10] w-full transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.05]"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-7">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
          <span className="font-semibold uppercase tracking-[0.14em] text-olive-600">
            {postCategoryLabels[post.category]}
          </span>
          <span aria-hidden className="text-line">
            &middot;
          </span>
          <time dateTime={post.publishedAt} className="text-muted">
            {formatDate(post.publishedAt)}
          </time>
        </div>

        <h3 className="mt-3.5 font-display text-xl leading-snug text-teal-800 transition-colors duration-300 group-hover:text-teal-600">
          <Link
            href={`/blog/${post.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {post.title}
          </Link>
        </h3>

        <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-muted">
          {post.excerpt}
        </p>

        <p className="mt-6 flex items-center gap-1.5 text-xs text-muted">
          <Clock className="size-3.5" strokeWidth={1.75} aria-hidden />
          {post.readingMinutes} min read
        </p>
      </div>
    </article>
  );
}
