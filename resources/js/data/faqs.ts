/**
 * Types and static values only. Content itself comes from Laravel as page
 * props (App\Support\SiteData), replacing the Next.js async getters.
 */

export type Faq = { question: string; answer: string };

/** Steps rendered by the online consultation process section. */
export const consultationSteps = [
  {
    step: "01",
    title: "Book your slot",
    detail:
      "Choose a date and time that suits you. Online and clinic appointments use the same booking form.",
    icon: "calendar",
  },
  {
    step: "02",
    title: "Share your history",
    detail:
      "Complete a short health questionnaire and upload any recent blood reports and clear photographs.",
    icon: "upload",
  },
  {
    step: "03",
    title: "Consult with Dr. Riji",
    detail:
      "A detailed video or in-person consultation of roughly forty-five minutes covering history, cause and plan.",
    icon: "video",
  },
  {
    step: "04",
    title: "Receive your prescription",
    detail:
      "Your individualised prescription, along with dietary and hair-care guidance, is issued after the consultation.",
    icon: "file",
  },
  {
    step: "05",
    title: "Medicines delivered",
    detail:
      "Medicines are dispensed by the clinic and couriered to your address, or collected in person.",
    icon: "package",
  },
  {
    step: "06",
    title: "Follow up and review",
    detail:
      "A review every four to six weeks, with comparison photographs, to assess response and adjust treatment.",
    icon: "refresh",
  },
] as const;
