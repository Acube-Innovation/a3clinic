/**
 * Types only. The doctor profile comes from Laravel as a page prop
 * (App\Support\SiteData::doctorProfile), replacing getDoctorProfile().
 */

type TitledDetail = { title: string; detail: string };

export type DoctorProfile = {
    biography: { intro: string; paragraphs: string[] };
    education: { year: string; qualification: string; institution: string; detail: string }[];
    timeline: { year: string; title: string; detail: string }[];
    achievements: TitledDetail[];
    mission: { mission: string; vision: string; values: TitledDetail[] };
    gallery: { slot: string; label: string }[];
};
