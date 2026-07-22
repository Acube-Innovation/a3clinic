import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("container-page", className)}>{children}</div>;
}

type Tone = "white" | "platinum" | "teal" | "gradient";

const tones: Record<Tone, string> = {
  white: "bg-white",
  platinum: "bg-platinum",
  teal: "bg-teal-900 text-teal-50",
  gradient: "bg-brand-gradient text-white",
};

export function Section({
  children,
  tone = "white",
  className,
  id,
  size = "md",
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  id?: string;
  size?: "sm" | "md" | "lg";
}) {
  const padding =
    size === "sm"
      ? "py-16 sm:py-20"
      : size === "lg"
        ? "py-24 sm:py-32 lg:py-40"
        : "py-20 sm:py-28 lg:py-32";

  return (
    <section
      id={id}
      className={cn("relative isolate", tones[tone], padding, className)}
    >
      {children}
    </section>
  );
}

export function Eyebrow({
  children,
  tone = "light",
  className,
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-eyebrow font-semibold uppercase",
        tone === "light" ? "text-olive-600" : "text-olive-300",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-px w-6",
          tone === "light" ? "bg-olive-500" : "bg-olive-400",
        )}
      />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "light",
  className,
  as: Heading = "h2",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  tone?: "light" | "dark";
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-5",
        align === "center" ? "mx-auto max-w-3xl text-center items-center" : "max-w-2xl",
        className,
      )}
    >
      {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      <Heading
        className={cn(
          "text-h2",
          tone === "dark" ? "text-white" : "text-teal-800",
        )}
      >
        {title}
      </Heading>
      {description ? (
        <p
          className={cn(
            "text-lead",
            tone === "dark" ? "text-teal-100/80" : "text-muted",
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
