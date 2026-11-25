import { Play } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * A video stored in content: a YouTube link (embedded from youtube-nocookie,
 * loaded only when played) or an uploaded file under /uploads/videos/.
 */
export function youTubeId(value: string): string | null {
  const m = value.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

export function VideoEmbed({
  src,
  title,
  className,
}: {
  src: string;
  title: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const id = youTubeId(src);
  const frame = cn(
    "relative aspect-video w-full overflow-hidden rounded-4xl bg-teal-900 ring-1 ring-line",
    className,
  );

  if (!id) {
    return (
      <div className={frame}>
        <video
          src={src}
          title={title}
          controls
          playsInline
          preload="metadata"
          className="size-full object-cover"
        />
      </div>
    );
  }

  if (playing) {
    return (
      <div className={frame}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className={cn(frame, "group block cursor-pointer text-left")}
      aria-label={`Play video: ${title}`}
    >
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-cover opacity-85 transition-opacity duration-300 group-hover:opacity-100"
      />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-16 place-items-center rounded-full bg-white/90 text-teal-800 shadow-lift transition-transform duration-300 group-hover:scale-105">
          <Play className="ml-1 size-7" strokeWidth={1.8} aria-hidden />
        </span>
      </span>
    </button>
  );
}
