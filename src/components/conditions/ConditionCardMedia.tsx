import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { cn } from "@/lib/utils";
import type { Condition } from "@/data/conditions";

/**
 * Photo strip at the top of a condition card.
 *
 * Uses the illustration uploaded against the condition, falling back to its
 * hero upload and then to in-palette artwork, so a grid never breaks when an
 * editor has not attached an image yet.
 */
export function ConditionCardMedia({
  condition,
  className,
}: {
  condition: Pick<Condition, "name" | "introImage" | "heroImage">;
  className?: string;
}) {
  const src = condition.introImage || condition.heroImage;

  return (
    <div className={cn("overflow-hidden", className)}>
      {src ? (
        // Admin upload served from our /uploads route.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          className="aspect-[16/10] w-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.05]"
        />
      ) : (
        <PlaceholderImage
          slot={`Illustrative image for condition — ${condition.name}`}
          variant="clinic"
          rounded="rounded-none"
          className="aspect-[16/10] w-full transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.05]"
        />
      )}
    </div>
  );
}
