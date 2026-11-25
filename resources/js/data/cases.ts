/**
 * Case reports (/results). Content comes from Laravel (App\Support\SiteData
 * cases / caseCards); consent details never reach the browser.
 */

export type CasePhoto = { view: string; image: string };

export type CaseStage = {
  label: string;
  timepoint: string;
  note: string;
  photos: CasePhoto[];
};

export type CaseReport = {
  slug: string;
  code: string;
  title: string;
  conditionSlug: string;
  conditionName: string;
  category: string;
  sex: "" | "female" | "male" | "other";
  ageBand: string;
  complaintDuration: string;
  followUp: string;
  summary: string;
  presentation: string;
  history: string;
  assessment: string;
  approach: string[];
  remedies: string;
  outcome: string;
  doctorNote: string;
  stages: CaseStage[];
  featured: boolean;
  /** Illustrative placeholder, never a real patient. */
  sample: boolean;
  noindex: boolean;
};

export type CaseCover = {
  before: string;
  beforeLabel: string;
  after: string;
  afterLabel: string;
};

export type CaseCard = Pick<
  CaseReport,
  | "slug"
  | "code"
  | "title"
  | "summary"
  | "conditionSlug"
  | "conditionName"
  | "category"
  | "sex"
  | "ageBand"
  | "followUp"
  | "featured"
  | "sample"
> & { cover: CaseCover | null; stageCount: number };

export const sexLabels: Record<string, string> = {
  female: "Female",
  male: "Male",
  other: "",
};

/** "Female, 28–32" — whichever parts exist. */
export function profileOf(c: Pick<CaseReport, "sex" | "ageBand">): string {
  return [sexLabels[c.sex] ?? "", c.ageBand ? `age ${c.ageBand}` : ""]
    .filter(Boolean)
    .join(", ");
}
