/**
 * MOCK patient-portal records.
 *
 * ⚠️ This is demonstration data for a signed-out preview. The real portal must
 * sit behind authentication and must never render another patient's data. See
 * README.md § Patient portal for the backend contract.
 */

export const patient = {
  name: "Demo Patient",
  id: "DRR-2026-0148",
  since: "2025-11-12",
};

export const appointments = [
  {
    id: "A-1042",
    date: "2026-08-04",
    time: "10:30",
    mode: "Online (video)",
    type: "Follow-up review",
    status: "upcoming" as const,
  },
  {
    id: "A-1021",
    date: "2026-06-23",
    time: "17:30",
    mode: "Online (video)",
    type: "Follow-up review",
    status: "completed" as const,
  },
  {
    id: "A-0993",
    date: "2026-05-12",
    time: "09:45",
    mode: "Clinic — Kattakkada",
    type: "First consultation",
    status: "completed" as const,
  },
];

export const prescriptions = [
  {
    id: "RX-2210",
    issued: "2026-06-23",
    summary: "Follow-up prescription — dosage adjusted after review",
    validUntil: "2026-08-04",
    items: 3,
  },
  {
    id: "RX-2104",
    issued: "2026-05-12",
    summary: "Initial prescription following first consultation",
    validUntil: "2026-06-23",
    items: 2,
  },
];

export const orders = [
  {
    id: "ORD-5581",
    placed: "2026-06-25",
    items: "Complete Hair Care Kit",
    total: 219500,
    status: "delivered" as const,
  },
  {
    id: "ORD-5402",
    placed: "2026-05-14",
    items: "Root Revival Hair Oil, Clarify Shampoo",
    total: 119000,
    status: "delivered" as const,
  },
];

export const reports = [
  {
    id: "R-311",
    name: "Thyroid profile (TSH, T3, T4)",
    uploaded: "2026-05-10",
    kind: "Blood report",
  },
  {
    id: "R-312",
    name: "Serum ferritin",
    uploaded: "2026-05-10",
    kind: "Blood report",
  },
  {
    id: "R-348",
    name: "Scalp photographs — crown, parting, hairline",
    uploaded: "2026-06-21",
    kind: "Progress photographs",
  },
];

export const invoices = [
  {
    id: "INV-8842",
    date: "2026-06-23",
    description: "Follow-up consultation",
    amount: 40000,
    status: "paid" as const,
  },
  {
    id: "INV-8710",
    date: "2026-05-12",
    description: "First consultation",
    amount: 70000,
    status: "paid" as const,
  },
];
