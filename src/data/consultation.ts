/**
 * Editable copy for the consultation page — the "What to have ready" list and
 * the medicine-delivery note. Managed via the "Consultation Page" workspace.
 */

import { readDoc } from "@/lib/admin/store";

export type ConsultationContent = {
  prepare: { title: string; detail: string }[];
  deliveryNote: string;
};

const defaults: ConsultationContent = {
  prepare: [
    {
      title: "Blood reports from the last year",
      detail:
        "Bring or upload them even if you were told they were normal. Some values are worth re-reading in the context of hair.",
    },
    {
      title: "A list of everything you take",
      detail:
        "All medicines, supplements and topical treatments, including anything bought without a prescription.",
    },
    {
      title: "Photographs from one or two years ago",
      detail:
        "Ordinary photographs where your hair is visible. They are surprisingly useful for judging change.",
    },
    {
      title: "For online: good scalp photographs",
      detail:
        "Front, crown and parting, in bright indoor daylight, hair dry and unstyled. Avoid direct overhead light.",
    },
  ],
  deliveryNote:
    "Medicines are dispensed by the clinic and couriered after your consultation. Delivery within Kerala typically takes two to three days, and elsewhere in India four to six. International delivery is possible for some destinations but is subject to local import rules, which vary considerably — the clinic will confirm before dispatch.",
};

export async function getConsultationContent(): Promise<ConsultationContent> {
  const stored = await readDoc<Partial<ConsultationContent>>(
    "consultation",
    defaults,
  );
  return { ...defaults, ...stored };
}

export function getConsultationDefaults(): ConsultationContent {
  return structuredClone(defaults);
}
