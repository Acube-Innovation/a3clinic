import { Container, Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { AmbientBlobs } from "@/components/ui/CurveDivider";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { cn } from "@/lib/utils";

/**
 * Standard masthead for inner pages. Carries the top padding needed to clear
 * the fixed header, so pages using it never deal with header offset directly.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  crumbs,
  children,
  tone = "light",
  align = "left",
  image,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  crumbs?: Crumb[];
  children?: React.ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  /** Optional background photograph; forces the dark treatment for contrast. */
  image?: string;
}) {
  // Plain light mastheads now carry the home banner's clinic photograph
  // under a dark-green overlay, so they take the dark (white text) treatment.
  const clinicPhoto = !image && tone === "light";
  const effectiveTone = image || clinicPhoto ? "dark" : tone;
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden pb-16 pt-32 sm:pb-20 sm:pt-40",
        effectiveTone === "light" ? "bg-platinum" : "bg-teal-900",
      )}
    >
      {image ? (
        <div aria-hidden className="absolute inset-0 -z-10">
          {/* Admin uploads are served from our own /uploads route. */}
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover"
          />
          {/* Scrim keeps the H1 legible over any photograph. */}
          <div className="absolute inset-0 bg-teal-950/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-950/70 via-teal-950/30 to-transparent" />
        </div>
      ) : clinicPhoto ? (
        <div aria-hidden className="absolute inset-0 -z-10">
          {/* The home banner's clinic photograph under a 75% dark-green
              overlay; the left fade keeps the white copy legible. */}
          <img
            src="/images/hero-clinic.jpg"
            alt=""
            className="h-full w-full object-cover object-left"
          />
          <div className="absolute inset-0 bg-teal-900/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-950/60 via-teal-950/25 to-transparent" />
        </div>
      ) : (
        <AmbientBlobs tone={effectiveTone} />
      )}

      <Container>
        {crumbs ? (
          <Breadcrumbs crumbs={crumbs} tone={effectiveTone} className="mb-8" />
        ) : null}

        <div
          className={cn(
            "flex flex-col gap-6",
            align === "center" ? "mx-auto max-w-3xl items-center text-center" : "max-w-3xl",
          )}
        >
          {eyebrow ? (
            <Reveal>
              <Eyebrow tone={effectiveTone}>{eyebrow}</Eyebrow>
            </Reveal>
          ) : null}

          <Reveal delay={0.05}>
            <h1
              className={cn(
                "text-h1",
                effectiveTone === "light" ? "text-teal-800" : "text-white",
              )}
            >
              {title}
            </h1>
          </Reveal>

          {description ? (
            <Reveal delay={0.1}>
              <p
                className={cn(
                  "text-lead",
                  effectiveTone === "light" ? "text-muted" : "text-teal-100/75",
                )}
              >
                {description}
              </p>
            </Reveal>
          ) : null}

          {children ? <Reveal delay={0.15}>{children}</Reveal> : null}
        </div>
      </Container>
    </section>
  );
}
