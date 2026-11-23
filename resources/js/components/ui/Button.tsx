import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "olive" | "lime" | "onDark";
type Size = "sm" | "md" | "lg" | "xl";

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-semibold " +
  "transition-[transform,box-shadow,background-color,color] duration-300 ease-[var(--ease-out-soft)] " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-teal-800 text-white shadow-soft hover:bg-teal-700 hover:shadow-lift hover:-translate-y-0.5",
  secondary:
    "bg-white text-teal-800 ring-1 ring-line hover:ring-teal-200 hover:bg-teal-50 hover:-translate-y-0.5 hover:shadow-soft",
  ghost: "text-teal-800 hover:bg-teal-50",
  olive:
    "bg-olive-500 text-white shadow-soft hover:bg-olive-600 hover:shadow-lift hover:-translate-y-0.5",
  // Matches the hero headline's olive accent; dark text for contrast on dark sections.
  lime:
    "bg-olive-300 text-teal-900 shadow-soft hover:bg-olive-200 hover:shadow-lift hover:-translate-y-0.5",
  onDark:
    "bg-white/10 text-white ring-1 ring-white/25 backdrop-blur-sm hover:bg-white/20 hover:-translate-y-0.5",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[0.9375rem]",
  lg: "h-14 px-8 text-base",
  xl: "h-16 px-8 text-lg",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = BaseProps &
  Omit<ComponentProps<"button">, keyof BaseProps> & { href?: never };

type ButtonAsLink = BaseProps &
  Omit<ComponentProps<typeof Link>, keyof BaseProps | "href"> & {
    href: string;
    external?: boolean;
  };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const {
    variant = "primary",
    size = "md",
    className,
    children,
    ...rest
  } = props;

  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in rest && rest.href !== undefined) {
    const { href, external, ...linkProps } = rest as ButtonAsLink;

    // External links (tel:, wa.me, mailto:) must bypass the locale-aware Link.
    if (external || /^(https?:|tel:|mailto:)/.test(href)) {
      return (
        <a
          href={href}
          className={classes}
          {...(external || href.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          {...(linkProps as ComponentProps<"a">)}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ComponentProps<"button">)}>
      {children}
    </button>
  );
}
