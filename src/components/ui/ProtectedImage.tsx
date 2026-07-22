"use client";

import { cn } from "@/lib/utils";

/**
 * Soft download deterrent for sensitive photographs: blocks right-click and
 * dragging. This is NOT protection — anyone can screenshot — which is why the
 * real safeguard is the watermark baked into the file at upload time.
 */
export function ProtectedImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      draggable={false}
      onContextMenu={(event) => event.preventDefault()}
      className={cn("select-none", className)}
    />
  );
}
