import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Hourglass,
  ImageIcon,
  Microscope,
  Quote,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";

import { PageHero } from "@/components/layout/PageHero";
import { Container, Section, Eyebrow } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { BookingCta } from "@/components/sections/BookingCta";
import { CompareSlider } from "@/components/cases/CompareSlider";
import { CaseCard } from "@/components/cases/CaseCard";
import { ResultsDisclaimer } from "@/components/cases/ResultsDisclaimer";
import { SampleBadge } from "@/components/cases/SampleBadge";
import { ProtectedImage } from "@/components/ui/ProtectedImage";
import Image from "@/lib/image";
import { Link } from "@/i18n/navigation";
import { profileOf, type CaseCard as CaseCardData, type CaseReport } from "@/data/cases";
import type { ConditionCard } from "@/data/conditions";
import { cn } from "@/lib/utils";

type Shot = { src: string; caption: string };

export default function CaseReportPage({
  report,
  preview = false,
  condition,
  related,
}: {
  report: CaseReport;
  preview?: boolean;
  condition: ConditionCard | null;
  related: CaseCardData[];
}) {
  const stages = report.stages.filter((s) => s.photos.length > 0);
  const first = stages[0];
  const last = stages[stages.length - 1];

  // Views photographed at both the first and the last visit can be compared.
  const views = useMemo(() => {
    if (!first || !last || first === last) return [];
    return first.photos.map((p) => p.view).filter((v) => last.photos.some((q) => q.view === v));
  }, [first, last]);
  const [view, setView] = useState(views[0] ?? "");
  const beforePhoto = first?.photos.find((p) => p.view === view) ?? first?.photos[0];
  const afterPhoto = last?.photos.find((p) => p.view === view) ?? last?.photos[0];

  // Every photo, in timeline order, for the lightbox.
  const shots: Shot[] = report.stages.flatMap((s) =>
    s.photos.map((p) => ({
      src: p.image,
      caption: [s.label, s.timepoint, p.view].filter(Boolean).join(" · "),
    })),
  );
  const [open, setOpen] = useState<number | null>(null);

  const facts = [
    { Icon: UserRound, label: "Patient", value: profileOf(report) },
    { Icon: Hourglass, label: "Complaint for", value: report.complaintDuration },
    { Icon: CalendarRange, label: "Documented over", value: report.followUp },
    { Icon: ImageIcon, label: "Visits photographed", value: stages.length ? String(stages.length) : "" },
  ].filter((f) => f.value);

  const notes = [
    { Icon: ClipboardList, title: "Presenting complaint", text: report.presentation },
    { Icon: Stethoscope, title: "Relevant history", text: report.history },
    { Icon: Microscope, title: "Assessment", text: report.assessment },
  ].filter((n) => n.text);

  return (
    <>
      <PageHero
        eyebrow={`Case report · ${report.code}`}
        title={report.title}
        description={report.summary}
        crumbs={[
          { name: "Patient Results", href: "/results" },
          { name: report.code, href: `/results/${report.slug}` },
        ]}
      >
        <div className="flex flex-wrap items-center gap-3">
          {report.conditionName ? (
            <Link
              href={`/conditions/${report.conditionSlug}`}
              className="rounded-full bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-800 ring-1 ring-teal-100 transition-colors hover:bg-teal-100"
            >
              {report.conditionName}
            </Link>
          ) : null}
          {report.sample ? <SampleBadge /> : null}
        </div>
      </PageHero>

      {/* ------------------------- Comparison + facts ------------------------- */}
      <Section size="sm" className="pt-0 sm:pt-0">
        <Container>
          {preview ? (
            <p className="mb-6 rounded-3xl bg-sky-50 px-6 py-4 text-sm leading-relaxed text-sky-900 ring-1 ring-sky-200">
              <strong>Draft preview.</strong> Only signed-in clinic staff can see this page. It goes live when the
              case is published in the admin, which needs signed consent on file.
            </p>
          ) : null}
          {report.sample ? (
            <p className="mb-6 rounded-3xl bg-amber-50 px-6 py-4 text-sm leading-relaxed text-amber-900 ring-1 ring-amber-200">
              <strong>Illustrative example.</strong> This is placeholder content showing how case reports are
              presented. It does not describe a real patient, and the photographs are placeholders.
            </p>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start">
            <Reveal>
              {beforePhoto && afterPhoto ? (
                <div className="overflow-hidden rounded-5xl bg-white ring-1 ring-line">
                  <CompareSlider
                    before={beforePhoto.image}
                    after={afterPhoto.image}
                    beforeLabel={[first.label, first.timepoint].filter(Boolean).join(" · ")}
                    afterLabel={[last.label, last.timepoint].filter(Boolean).join(" · ")}
                    alt={`${report.conditionName} case ${report.code}, ${view || beforePhoto.view} view`}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <p className="text-sm text-muted">Drag the handle to compare the first and latest visit.</p>
                    {views.length > 1 ? (
                      <div role="group" aria-label="Photo view" className="flex gap-1.5">
                        {views.map((v) => (
                          <button
                            key={v}
                            type="button"
                            aria-pressed={v === view}
                            onClick={() => setView(v)}
                            className={cn(
                              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                              v === view ? "bg-teal-800 text-white" : "bg-platinum text-ink/70 hover:bg-teal-50",
                            )}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="grid aspect-[4/3] place-items-center rounded-5xl bg-platinum text-sm text-muted ring-1 ring-line">
                  Photographs will be added to this case.
                </div>
              )}
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-5xl bg-platinum p-7 ring-1 ring-line sm:p-8">
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Case at a glance</h2>
                <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-6">
                  {facts.map(({ Icon, label, value }) => (
                    <div key={label}>
                      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted">
                        <Icon className="size-3.5 text-teal-500" aria-hidden />
                        {label}
                      </dt>
                      <dd className="mt-1 text-[0.9375rem] font-semibold text-teal-800">{value}</dd>
                    </div>
                  ))}
                </dl>
                {report.doctorNote ? (
                  <figure className="mt-7 border-t border-line pt-6">
                    <Quote className="size-5 text-olive-500" strokeWidth={1.75} aria-hidden />
                    <blockquote className="mt-2 text-[0.9375rem] italic leading-relaxed text-ink/80">
                      {report.doctorNote}
                    </blockquote>
                    <figcaption className="mt-4 flex items-center gap-3">
                      <span className="relative size-10 overflow-hidden rounded-full ring-2 ring-white">
                        <Image src="/images/doctor-portrait.jpg" alt="" fill className="object-cover object-top" />
                      </span>
                      <span className="text-sm">
                        <span className="block font-semibold text-teal-800">Dr. Riji Rasheed</span>
                        <span className="text-muted">BHMS</span>
                      </span>
                    </figcaption>
                  </figure>
                ) : null}
                <Button href="/book" className="mt-7 w-full">
                  Discuss a similar concern
                </Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ------------------------------ Case notes ----------------------------- */}
      {notes.length > 0 ? (
        <Section tone="platinum" size="sm">
          <Container>
            <Reveal>
              <Eyebrow>The case</Eyebrow>
            </Reveal>
            <Stagger className={cn("mt-8 grid gap-5", notes.length === 3 ? "lg:grid-cols-3" : "md:grid-cols-2")}>
              {notes.map(({ Icon, title, text }) => (
                <StaggerItem key={title} className="h-full">
                  <div className="h-full rounded-4xl bg-white p-7 ring-1 ring-line">
                    <span className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                      <Icon className="size-5" strokeWidth={1.7} aria-hidden />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-teal-800">{title}</h3>
                    <p className="mt-2.5 whitespace-pre-line text-[0.9375rem] leading-relaxed text-muted">{text}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </Section>
      ) : null}

      {/* ------------------------------- Approach ------------------------------ */}
      {report.approach.length > 0 ? (
        <Section size="sm">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <Reveal>
                <Eyebrow>Treatment approach</Eyebrow>
                <h2 className="mt-6 text-h2 text-teal-800">How the case was managed</h2>
                {report.remedies ? (
                  <p className="mt-6 rounded-3xl bg-platinum p-5 text-sm leading-relaxed text-muted ring-1 ring-line">
                    <span className="font-semibold text-teal-800">Remedies prescribed: </span>
                    {report.remedies}
                  </p>
                ) : (
                  <p className="mt-5 text-[0.9375rem] leading-relaxed text-muted">
                    Homeopathic prescriptions are individual to each patient, so the specific remedies are not
                    listed. The same diagnosis can need a different prescription in someone else.
                  </p>
                )}
              </Reveal>
              <Stagger as="ol" className="flex flex-col gap-3">
                {report.approach.map((step, i) => (
                  <StaggerItem as="li" key={i}>
                    <div className="flex gap-4 rounded-3xl bg-platinum p-5 ring-1 ring-line">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-teal-800 text-sm font-semibold text-white">
                        {i + 1}
                      </span>
                      <p className="pt-1 text-[0.9375rem] leading-relaxed text-ink/80">{step}</p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </Container>
        </Section>
      ) : null}

      {/* ------------------------------- Timeline ------------------------------ */}
      {report.stages.length > 0 ? (
        <Section tone="platinum" size="sm">
          <Container>
            <Reveal>
              <Eyebrow>Progress timeline</Eyebrow>
              <h2 className="mt-6 text-h2 text-teal-800">Visit by visit</h2>
            </Reveal>

            <ol className="relative mt-12 flex flex-col gap-10 before:absolute before:bottom-4 before:left-[0.9375rem] before:top-4 before:w-px before:bg-teal-200 sm:before:left-[1.1875rem]">
              {report.stages.map((stage, i) => {
                const offset = report.stages.slice(0, i).reduce((n, s) => n + s.photos.length, 0);
                return (
                  <li key={i} className="relative pl-12 sm:pl-16">
                    <span
                      className={cn(
                        "absolute left-0 top-0 grid size-8 place-items-center rounded-full text-xs font-bold ring-4 ring-platinum sm:size-10",
                        i === report.stages.length - 1 ? "bg-olive-500 text-white" : "bg-teal-800 text-white",
                      )}
                    >
                      {i + 1}
                    </span>
                    <Reveal>
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="text-xl font-semibold text-teal-800">{stage.label}</h3>
                        {stage.timepoint ? (
                          <span className="text-sm font-semibold text-olive-600">{stage.timepoint}</span>
                        ) : null}
                      </div>
                      {stage.note ? (
                        <p className="mt-2 max-w-3xl text-[0.9375rem] leading-relaxed text-muted">{stage.note}</p>
                      ) : null}
                      {stage.photos.length > 0 ? (
                        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                          {stage.photos.map((photo, j) => (
                            <button
                              key={j}
                              type="button"
                              onClick={() => setOpen(offset + j)}
                              className="group relative overflow-hidden rounded-3xl bg-white ring-1 ring-line focus-visible:outline-2 focus-visible:outline-olive-500"
                            >
                              <ProtectedImage
                                src={photo.image}
                                alt={`${stage.label} ${stage.timepoint} — ${photo.view} view`}
                                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                              />
                              <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[0.6875rem] font-semibold text-teal-800 backdrop-blur-sm">
                                {photo.view}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </Container>
        </Section>
      ) : null}

      {/* -------------------------------- Outcome ------------------------------ */}
      <Section size="sm">
        <Container>
          <div className="mx-auto max-w-4xl">
            {report.outcome ? (
              <Reveal>
                <Eyebrow>Observed outcome</Eyebrow>
                <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-ink/85">{report.outcome}</p>
              </Reveal>
            ) : null}
            <ResultsDisclaimer className="mt-10 bg-platinum" />

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              {condition ? (
                <Button href={`/conditions/${condition.slug}`} variant="secondary">
                  About {condition.name.toLowerCase()}
                </Button>
              ) : null}
              <Button href={`/results?condition=${report.conditionSlug}`} variant="ghost">
                More {report.conditionName ? report.conditionName.toLowerCase() : ""} cases
                <ArrowRight aria-hidden className="size-4" />
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* -------------------------------- Related ------------------------------ */}
      {related.length > 0 ? (
        <Section tone="platinum" size="sm">
          <Container>
            <div className="flex items-baseline gap-5">
              <h2 className="text-h3 text-teal-800">Related cases</h2>
              <span aria-hidden className="rule-olive flex-1" />
            </div>
            <Stagger className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <StaggerItem key={item.slug} className="h-full">
                  <CaseCard item={item} />
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </Section>
      ) : null}

      <BookingCta />

      {open !== null ? <Lightbox shots={shots} index={open} onIndex={setOpen} /> : null}
    </>
  );
}

function Lightbox({
  shots,
  index,
  onIndex,
}: {
  shots: Shot[];
  index: number;
  onIndex: (i: number | null) => void;
}) {
  const go = (d: number) => onIndex((index + d + shots.length) % shots.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onIndex(null);
      if (e.key === "ArrowRight") onIndex((index + 1) % shots.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + shots.length) % shots.length);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [index, shots.length, onIndex]);

  const shot = shots[index];
  const nav = "grid size-12 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={shot.caption}
      className="fixed inset-0 z-[100] flex flex-col bg-teal-950/95 backdrop-blur-sm"
      onClick={() => onIndex(null)}
    >
      <div className="flex items-center justify-between px-6 py-4 text-sm text-teal-50/80">
        <span>
          {shot.caption} <span className="ml-2 opacity-60">{index + 1} / {shots.length}</span>
        </span>
        <button type="button" aria-label="Close" className={nav} onClick={() => onIndex(null)}>
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center gap-4 px-4 pb-8" onClick={(e) => e.stopPropagation()}>
        <button type="button" aria-label="Previous photo" className={nav} onClick={() => go(-1)}>
          <ChevronLeft className="size-6" aria-hidden />
        </button>
        <ProtectedImage src={shot.src} alt={shot.caption} className="max-h-full min-w-0 rounded-3xl object-contain" />
        <button type="button" aria-label="Next photo" className={nav} onClick={() => go(1)}>
          <ChevronRight className="size-6" aria-hidden />
        </button>
      </div>
    </div>
  );
}
