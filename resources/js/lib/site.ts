/**
 * Single source of truth for clinic identity, contact details and navigation.
 * Anything that appears in more than one place (footer, header, JSON-LD,
 * contact page, WhatsApp links) reads from here.
 */

export const site = {
  name: "Dr. Riji's Health Care",
  shortName: "Dr. Riji's",
  tagline: "Healthy Hair. Whole-body Healing.",
  description:
    "Homeopathic care for hair fall, scalp disorders, skin conditions and chronic illness. Consult Dr. Riji Rasheed (BHMS) online or at the Kattakkada clinic.",
  // TODO(client): replace with the live domain before launch — this is used for
  // canonical URLs, Open Graph tags, sitemap.xml and all JSON-LD @id values.
  url: "https://drrijishealthcare.com",
  locale: "en_IN",
  currency: "INR",
} as const;

export const doctor = {
  name: "Dr. Riji Rasheed",
  credentials: "BHMS",
  fullName: "Dr. Riji Rasheed, BHMS",
  role: "Homeopathic Physician",
  speciality: "Hair & Scalp Disorders",
  registration: "TODO(client): Kerala State Homoeopathy Council reg. no.",
} as const;

export const contact = {
  phone: "9645119355",
  phoneIntl: "+919645119355",
  phoneDisplay: "+91 96451 19355",
  whatsapp: "919645119355",
  email: "care@drrijishealthcare.com", // TODO(client): confirm live inbox
  address: {
    line1: "Dr. Riji's Health Care",
    line2: "Main Road, Kattakkada",
    city: "Kattakkada",
    district: "Thiruvananthapuram",
    state: "Kerala",
    postalCode: "695572",
    country: "IN",
  },
  // TODO(client): replace with surveyed coordinates for the clinic entrance.
  geo: { lat: 8.4167, lng: 77.0667 },
  hours: [
    { days: "Monday – Saturday", time: "9:00 AM – 1:00 PM" },
    { days: "Monday – Saturday", time: "4:00 PM – 7:30 PM" },
    { days: "Sunday", time: "Online consultation only" },
  ],
  // Schema.org openingHours format, kept beside the human-readable version.
  openingHoursSpec: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:00", closes: "13:00" },
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "16:00", closes: "19:30" },
  ],
} as const;

export const social = {
  instagram: "https://instagram.com/drrijishealthcare",
  facebook: "https://facebook.com/drrijishealthcare",
  youtube: "https://youtube.com/@drrijishealthcare",
  whatsapp: `https://wa.me/${contact.whatsapp}`,
  googleReviews: "https://g.page/drrijishealthcare",
} as const;

export function whatsappLink(message: string) {
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

/* Client-safe formatters for admin-managed numbers (data modules are
   server-only; these run anywhere). */

function digitsOf(raw: string) {
  return raw.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
}

export function phoneIntlOf(raw: string) {
  return `+91${digitsOf(raw)}`;
}

export function phoneDisplayOf(raw: string) {
  const digits = digitsOf(raw);
  return digits.length === 10
    ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
    : `+91 ${digits}`;
}

export function waHrefOf(raw: string, message?: string) {
  const base = `https://wa.me/91${digitsOf(raw)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Primary navigation. `children` renders as a mega-menu column on desktop. */
export const mainNav = [
  { key: "about", href: "/about" },
  {
    key: "treatments",
    href: "/hair-treatment",
    children: [
      { key: "hairTreatment", href: "/hair-treatment" },
      { key: "hairFall", href: "/conditions/hair-fall" },
      { key: "alopecia", href: "/conditions/alopecia" },
      { key: "dandruff", href: "/conditions/dandruff" },
      { key: "greyHair", href: "/conditions/premature-greying" },
      { key: "hairThinning", href: "/conditions/hair-thinning" },
      { key: "allConditions", href: "/conditions" },
    ],
  },
  { key: "shop", href: "/shop" },
  { key: "consultation", href: "/consultation" },
  { key: "testimonials", href: "/#testimonials" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact" },
] as const;

export const footerNav = {
  treatments: [
    { key: "hairFall", href: "/conditions/hair-fall" },
    { key: "alopecia", href: "/conditions/alopecia" },
    { key: "dandruff", href: "/conditions/dandruff" },
    { key: "skinDisease", href: "/conditions/skin-disease" },
    { key: "thyroid", href: "/conditions/thyroid" },
    { key: "pcod", href: "/conditions/pcod" },
  ],
  products: [
    { key: "hairOil", href: "/shop?category=hair-oil" },
    { key: "hairSerum", href: "/shop?category=hair-serum" },
    { key: "shampoo", href: "/shop?category=shampoo" },
    { key: "hairKit", href: "/shop?category=hair-kit" },
    { key: "skinCare", href: "/shop?category=skin-care" },
    { key: "allProducts", href: "/shop" },
  ],
  clinic: [
    { key: "about", href: "/about" },
    { key: "consultation", href: "/consultation" },
    { key: "book", href: "/book" },
    { key: "portal", href: "/portal" },
    { key: "blog", href: "/blog" },
    { key: "contact", href: "/contact" },
  ],
  legal: [
    { key: "privacy", href: "/privacy" },
    { key: "terms", href: "/terms" },
  ],
} as const;
