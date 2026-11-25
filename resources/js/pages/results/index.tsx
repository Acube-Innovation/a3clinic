import { useMemo, useState } from "react";
import { usePage } from "@inertiajs/react";
import { Camera, FileCheck2, ShieldCheck, SearchX } from "lucide-react";

import { PageHero } from "@/components/layout/PageHero";
import { Container, Section } from "@/components/ui/Section";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { BookingCta } from "@/components/sections/BookingCta";
import { CaseCard } from "@/components/cases/CaseCard";
import { ResultsDisclaimer } from "@/components/cases/ResultsDisclaimer";
import { Button } from "@/components/ui/Button";
import { categoryLabels, type ConditionCategory } from "@/data/conditions";
import type { CaseCard as CaseCardData } from "@/data/cases";
import { cn } from "@/lib/utils";

const categoryOrder: ConditionCategory[] = ["hair", "skin", "chronic", "womens", "child"];

const assurances = [
  { Icon: ShieldCheck, title: "Anonymised", detail: "No names, faces or identifying details. Each case has a code, nothing more." },
  { Icon: FileCheck2, title: "Consented", detail: "Published only with the patient's written, revocable consent." },
  { Icon: Camera, title: "Standardised", detail: "Same angles and lighting at every visit, so photos are genuinely comparable." },
];

export default function ResultsPage({
  cases,
  conditions,
}: {
  cases: CaseCardData[];
  conditions: { slug: string; name: string; category: string }[];
}) {
  // Filters live in the URL (?category=hair&condition=hair-fall) so links
  // from condition pages and the menu land pre-filtered.
  const { url } = usePage();
  const initial = new URLSearchParams(url.split("?")[1] ?? "");
  const [category, setCategory] = useState(initial.get("category") ?? "");
  const [condition, setCondition] = useState(initial.get("condition") ?? "");

  const sync = (next: { category: string; condition: string }) => {
    const params = new URLSearchParams();
    if (next.category) params.set("category", next.category);
    if (next.condition) params.set("condition", next.condition);
    const qs = params.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  };

  const pickCategory = (value: string) => {
    // A condition outside the new category no longer applies.
    const keep = conditions.find((c) => c.slug === condition)?.category === value;
    const next = { category: value, condition: value && keep ? condition : "" };
    setCategory(next.category);
    setCondition(next.condition);
    sync(next);
  };
  const pickCondition = (value: string) => {
    const next = { category: value ? (conditions.find((c) => c.slug === value)?.category ?? "") : category, condition: value };
    setCategory(next.category);
    setCondition(next.condition);
    sync(next);
  };

  const categories = categoryOrder.filter((cat) => cases.some((c) => c.category === cat));
  const visibleConditions = conditions.filter((c) => !category || c.category === category);
  const shown = useMemo(
    () =>
      cases.filter(
        (c) => (!category || c.category === category) && (!condition || c.conditionSlug === condition),
      ),
    [cases, category, condition],
  );

  const chip = (active: boolean) =>
    cn(
      "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
      active ? "bg-teal-800 text-white" : "bg-white text-ink/75 ring-1 ring-line hover:bg-teal-50 hover:text-teal-800",
    );

  return (
    <>
      <PageHero
        eyebrow="Patient results"
        title="Case reports, documented visit by visit"
        description="Anonymised cases from the clinic: what each patient came with, how it was assessed and treated, and what the standardised photographs showed over time, including what did not change."
        crumbs={[{ name: "Patient Results", href: "/results" }]}
      />

      <Section size="sm">
        <Container>
          <Stagger className="grid gap-5 sm:grid-cols-3">
            {assurances.map(({ Icon, title, detail }) => (
              <StaggerItem key={title}>
                <div className="flex h-full gap-4 rounded-3xl bg-platinum p-6 ring-1 ring-line">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-olive-600 ring-1 ring-line">
                    <Icon className="size-5" strokeWidth={1.7} aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-teal-800">{title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{detail}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      <Section size="sm" className="pt-0 sm:pt-0">
        <Container>
          {cases.length > 0 ? (
            <>
              {/* ------------------------------ Filters ------------------------------ */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
                  <button type="button" aria-pressed={!category} onClick={() => pickCategory("")} className={chip(!category)}>
                    All <span className="ml-1 opacity-70">{cases.length}</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      aria-pressed={category === cat}
                      onClick={() => pickCategory(cat)}
                      className={chip(category === cat)}
                    >
                      {categoryLabels[cat]}{" "}
                      <span className="ml-1 opacity-70">{cases.filter((c) => c.category === cat).length}</span>
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-3 text-sm text-muted">
                  <span className="shrink-0">Condition</span>
                  <select
                    value={condition}
                    onChange={(e) => pickCondition(e.target.value)}
                    className="h-11 min-w-60 rounded-full border border-line bg-white px-4 text-sm text-ink focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/15"
                  >
                    <option value="">All conditions</option>
                    {visibleConditions.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* ------------------------------- Grid -------------------------------- */}
              {shown.length > 0 ? (
                <Stagger key={`${category}|${condition}`} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.map((item) => (
                    <StaggerItem key={item.slug} className="h-full">
                      <CaseCard item={item} />
                    </StaggerItem>
                  ))}
                </Stagger>
              ) : (
                <div className="mt-10 flex flex-col items-center rounded-4xl bg-platinum px-6 py-16 text-center ring-1 ring-line">
                  <SearchX className="size-8 text-teal-400" strokeWidth={1.5} aria-hidden />
                  <p className="mt-4 font-semibold text-teal-800">No published cases for this filter yet.</p>
                  <button type="button" onClick={() => pickCategory("")} className="mt-3 text-sm font-semibold text-olive-600 hover:text-olive-700">
                    Show all cases
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center rounded-5xl bg-platinum px-6 py-20 text-center ring-1 ring-line">
              <Camera className="size-9 text-teal-400" strokeWidth={1.5} aria-hidden />
              <h2 className="mt-5 text-h3 text-teal-800">Case reports are being prepared</h2>
              <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-muted">
                Each case is published only after the patient has signed consent and the report has been
                reviewed. In the meantime, the doctor is happy to talk you through similar cases at a consultation.
              </p>
              <Button href="/book" className="mt-7">Book a consultation</Button>
            </div>
          )}

          <ResultsDisclaimer className="mt-12 bg-platinum" />
        </Container>
      </Section>

      <BookingCta />
    </>
  );
}
