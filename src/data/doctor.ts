/**
 * Biography and credentials for the About page.
 *
 * Admin-editable: reads content/doctor.json when present, else the in-code
 * defaults below (exposed through getDoctorProfile()).
 *
 * TODO(client): every date, institution and award below is placeholder text.
 * Credentials must be verified and corrected before launch — misstated medical
 * qualifications carry regulatory consequences well beyond a website error.
 */

const biography = {
  intro:
    "Dr. Riji Rasheed is a homeopathic physician practising in Kattakkada, Thiruvananthapuram, with a clinical focus on hair and scalp disorders alongside general homeopathic practice.",
  paragraphs: [
    "The focus on hair came from patients rather than from a plan. Over the first years of practice, a pattern kept repeating: people arriving after months of shampoos, oils and topical treatments that had never worked, because nobody had asked what was happening in the rest of their body. Hair fall that turned out to be untreated thyroid disease. Thinning at the parting that was the first visible sign of PCOD. Shedding six months after a difficult delivery that would have settled on its own with the right reassurance.",
    "That pattern shaped how the clinic works today. A first consultation runs to about forty-five minutes and covers medical history, family history, diet, sleep, stress and — where relevant — menstrual history, before the scalp is examined at all. Blood tests are requested where the history points to something correctable. It is a slower start than most patients expect, and it is deliberate.",
    "Alongside clinic practice, Dr. Riji formulates a small range of hair and skin care products, developed in response to a recurring problem: patients following good treatment while using harsh products that undid the progress. The range is deliberately small, cosmetic in nature, and positioned as support for treatment rather than a substitute for it.",
    "Online consultation was introduced in 2021 and now accounts for a substantial share of the practice, with patients across India and the Gulf. The format is the same — the same history-taking, the same follow-up schedule — conducted over video with reports uploaded in advance.",
  ],
};

const education = [
  {
    year: "2011",
    qualification: "BHMS — Bachelor of Homeopathic Medicine and Surgery",
    institution: "TODO(client): confirm college and university",
    detail: "Five-and-a-half year professional degree including a rotating internship.",
  },
  {
    year: "2013",
    qualification: "Certificate course in Trichology",
    institution: "TODO(client): confirm awarding body",
    detail: "Focused study of hair and scalp disorders and their systemic causes.",
  },
  {
    year: "2017",
    qualification: "Advanced training — Dermatology in homeopathic practice",
    institution: "TODO(client): confirm awarding body",
    detail: "Clinical training in chronic skin disease management.",
  },
];

const timeline = [
  {
    year: "2011",
    title: "Graduated BHMS",
    detail: "Completed the degree and rotating internship.",
  },
  {
    year: "2013",
    title: "Opened the Kattakkada clinic",
    detail: "General homeopathic practice serving Kattakkada and the surrounding panchayats.",
  },
  {
    year: "2016",
    title: "Dedicated hair and scalp practice",
    detail: "Established a distinct consultation pathway for hair disorders after they became the largest single presenting complaint.",
  },
  {
    year: "2019",
    title: "First formulated products",
    detail: "Developed the initial scalp oil and shampoo for use alongside treatment.",
  },
  {
    year: "2021",
    title: "Online consultation launched",
    detail: "Video consultation introduced, extending the practice to patients outside Kerala.",
  },
  {
    year: "2024",
    title: "Complete care range",
    detail: "Expanded to the current hair and skin range, with a routine card issued at consultation.",
  },
];

const achievements = [
  {
    title: "Community health camps",
    detail:
      "Regular free consultation camps across Kattakkada panchayat, with a focus on adolescent and women's health.",
  },
  {
    title: "Patient education",
    detail:
      "Ongoing Malayalam-language content on hair and scalp health, correcting common misinformation about hair loss.",
  },
  {
    title: "Product formulation",
    detail:
      "Developed a range of cosmetic hair and skin preparations for use alongside clinical treatment.",
  },
  {
    title: "Online practice",
    detail:
      "Established a video consultation pathway now serving patients across India and the Gulf.",
  },
];

const mission = {
  mission:
    "To treat the person rather than the complaint — identifying why hair or skin is behaving as it is, and being honest about what treatment can and cannot achieve.",
  vision:
    "To make careful, unhurried homeopathic care accessible to patients wherever they are, and to raise the standard of what people expect from a hair consultation.",
  values: [
    {
      title: "Honesty about outcomes",
      detail:
        "Patients are told at the first consultation what is realistically achievable in their case — including when the answer is limited. No guaranteed results, no fixed-outcome packages.",
    },
    {
      title: "Investigate before prescribing",
      detail:
        "Where the history points to a thyroid, iron or hormonal cause, testing comes before treatment. Treating the scalp alone rarely holds.",
    },
    {
      title: "Alongside, not instead of",
      detail:
        "Homeopathic treatment complements conventional care. No patient is ever advised to stop a medication prescribed by another physician.",
    },
    {
      title: "Time in the consultation",
      detail:
        "A first consultation runs to roughly forty-five minutes because the history is where the diagnosis usually is.",
    },
  ],
};

/** Photo slots for the About page gallery. */
const gallery = [
  { slot: "Clinic reception and waiting area", label: "Reception" },
  { slot: "Consultation room, wide shot", label: "Consultation room" },
  { slot: "Dr. Riji in consultation with a patient (consented)", label: "In consultation" },
  { slot: "Dispensary and medicine storage", label: "Dispensary" },
  { slot: "Product formulation workspace", label: "Formulation" },
  { slot: "Clinic exterior and signage from the road", label: "Exterior" },
];

/* ---------------------------------------------------------------- accessor */

import { readDoc } from "@/lib/admin/store";

export type DoctorProfile = {
  biography: typeof biography;
  education: typeof education;
  timeline: typeof timeline;
  achievements: typeof achievements;
  mission: typeof mission;
  gallery: typeof gallery;
};

const profileDefaults: DoctorProfile = {
  biography,
  education,
  timeline,
  achievements,
  mission,
  gallery,
};

export async function getDoctorProfile(): Promise<DoctorProfile> {
  return readDoc<DoctorProfile>("doctor", profileDefaults);
}

/** The raw defaults, used by the admin panel to seed first-time edits. */
export function getDoctorDefaults(): DoctorProfile {
  return structuredClone(profileDefaults);
}
