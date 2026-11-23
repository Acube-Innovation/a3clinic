import { cn } from "@/lib/utils";

/**
 * Deterministic in-palette artwork standing in for real photography.
 *
 * Why not a grey box: grey boxes make a composed layout look broken, and they
 * hide spacing/contrast problems until photos arrive. These render organic
 * teal/olive gradient forms at the true aspect ratio, so the page can be
 * design-reviewed today.
 *
 * Every instance carries `data-photo-slot`, so the full shot list can be
 * extracted with:  grep -rn 'data-photo-slot' src/
 */

type Variant = "portrait" | "product" | "editorial" | "clinic" | "abstract";

const palettes: Record<Variant, [string, string, string]> = {
  portrait: ["#044B4D", "#156063", "#7A9833"],
  // Light enough to read as packshot-on-white, but with enough depth that a
  // card does not look like an empty box before real photography lands.
  product: ["#DCEBEB", "#B0CFCE", "#9DB955"],
  editorial: ["#0A5456", "#2E797C", "#9DB955"],
  clinic: ["#F7F8F8", "#DCEBEB", "#8ABABC"],
  abstract: ["#033A3C", "#044B4D", "#647E27"],
};

/** Stable 32-bit hash so the same slot always renders the same composition. */
function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function PlaceholderImage({
  slot,
  variant = "abstract",
  className,
  rounded = "rounded-4xl",
  label,
}: {
  /** Human description of the photo that belongs here. Shows on hover in dev. */
  slot: string;
  variant?: Variant;
  className?: string;
  rounded?: string;
  /** Optional visible caption, used for gallery tiles. */
  label?: string;
}) {
  const seed = hash(slot);
  const [c1, c2, c3] = palettes[variant];
  const id = `ph-${seed.toString(36)}`;

  // Derive blob geometry from the hash — varied but reproducible.
  const angle = seed % 180;
  const cx1 = 20 + (seed % 35);
  const cy1 = 18 + ((seed >> 3) % 30);
  const r1 = 28 + ((seed >> 5) % 18);
  const cx2 = 55 + ((seed >> 7) % 30);
  const cy2 = 55 + ((seed >> 9) % 30);
  const r2 = 22 + ((seed >> 11) % 20);

  return (
    <div
      data-photo-slot={slot}
      title={`Photo slot: ${slot}`}
      role="img"
      aria-label={slot}
      className={cn("relative overflow-hidden bg-platinum", rounded, className)}
    >
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={`${id}-bg`} gradientTransform={`rotate(${angle})`}>
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
          <radialGradient id={`${id}-a`}>
            <stop offset="0%" stopColor={c3} stopOpacity="0.55" />
            <stop offset="100%" stopColor={c3} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-b`}>
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <filter id={`${id}-grain`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="3"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        <rect width="100" height="100" fill={`url(#${id}-bg)`} />
        <circle cx={cx1} cy={cy1} r={r1} fill={`url(#${id}-a)`} />
        <circle cx={cx2} cy={cy2} r={r2} fill={`url(#${id}-b)`} />

        {/* Fine grain keeps large gradients from banding. */}
        <rect
          width="100"
          height="100"
          filter={`url(#${id}-grain)`}
          opacity="0.06"
        />
      </svg>

      {label ? (
        <span className="absolute bottom-4 left-4 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-teal-800 backdrop-blur-sm">
          {label}
        </span>
      ) : null}
    </div>
  );
}
