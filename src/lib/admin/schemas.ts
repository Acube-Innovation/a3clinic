/**
 * Declarative form schemas for the admin panel. One generic <RecordForm>
 * renders any of these, so adding an editable collection is config, not code.
 *
 * Field kinds:
 *   text | textarea | number | price (₹ shown, paise stored) | toggle |
 *   select | lines (string[] — one per line) | image (uploaded, stores URL) |
 *   repeater (object[])
 */

export type FieldDef = {
  name: string;
  label: string;
  kind:
    | "text"
    | "textarea"
    | "number"
    | "price"
    | "toggle"
    | "select"
    | "lines"
    | "image"
    | "repeater";
  hint?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  /** image fields: bake the clinic watermark into the file at upload. */
  watermark?: boolean;
  /** For repeater fields. */
  fields?: FieldDef[];
};

export type CollectionDef = {
  key: string;
  label: string;
  /** Singular noun for buttons: "Add product". */
  noun: string;
  kind: "collection" | "singleton";
  /** Field shown in list rows. */
  titleField: string;
  /** Extra field shown as a subtitle in list rows. */
  subtitleField?: string;
  fields: FieldDef[];
};

const conditionFields: FieldDef[] = [
  { name: "name", label: "Condition name", kind: "text", required: true },
  {
    name: "category",
    label: "Category",
    kind: "select",
    required: true,
    options: [
      { value: "hair", label: "Hair & Scalp" },
      { value: "skin", label: "Skin" },
      { value: "chronic", label: "Chronic & Lifestyle" },
      { value: "womens", label: "Women's Health" },
      { value: "child", label: "Child Care" },
    ],
  },
  {
    name: "featured",
    label: "Featured",
    kind: "toggle",
    hint: "Featured conditions appear in the header's Treatments dropdown, and hair conditions also feature on the hair-treatment page.",
  },
  {
    name: "summary",
    label: "Summary",
    kind: "textarea",
    required: true,
    hint: "One sentence. Used on cards and as the meta description.",
  },
  { name: "intro", label: "Introduction", kind: "textarea", required: true },
  {
    name: "heroImage",
    label: "Header background image",
    kind: "image",
    hint: "Shown behind this condition's page title. Wide images (around 1600×700) work best.",
  },
  {
    name: "introImage",
    label: "Introduction image",
    kind: "image",
    hint: "Shown beside the introduction — what the condition looks like. Use only images you have rights to; patient photos need written consent.",
  },
  {
    name: "symptoms",
    label: "Symptoms",
    kind: "lines",
    hint: "One symptom per line.",
  },
  { name: "causes", label: "Causes", kind: "lines", hint: "One cause per line." },
  {
    name: "treatment",
    label: "Treatment approach",
    kind: "lines",
    hint: "One step per line, in order.",
  },
  {
    name: "expectedResults",
    label: "What to expect (timeline)",
    kind: "repeater",
    hint: "Keep wording indicative — no guaranteed outcomes.",
    fields: [
      { name: "phase", label: "Phase", kind: "text" },
      { name: "detail", label: "Detail", kind: "textarea" },
    ],
  },
  {
    name: "faqs",
    label: "FAQs",
    kind: "repeater",
    fields: [
      { name: "question", label: "Question", kind: "text" },
      { name: "answer", label: "Answer", kind: "textarea" },
    ],
  },
  {
    name: "results",
    label: "Before & after photos",
    kind: "repeater",
    hint:
      "Shown on this condition's page, and collected into the site-wide progress section. Photos are watermarked automatically on upload. " +
      "COMPLIANCE: publish a real patient pair only with written, signed, revocable consent on file, and never name the patient — see README § Compliance.",
    fields: [
      { name: "before", label: "Before photo", kind: "image", watermark: true },
      { name: "after", label: "After photo", kind: "image", watermark: true },
      {
        name: "label",
        label: "Case label",
        kind: "text",
        hint: 'e.g. "Photographs 6 months apart" — no names. Leave blank to use the condition name.',
      },
      {
        name: "note",
        label: "Note",
        kind: "textarea",
        hint: "Optional context. Describe the documentation, not a promised outcome.",
      },
    ],
  },
];

const productFields: FieldDef[] = [
  { name: "name", label: "Product name", kind: "text", required: true },
  {
    name: "category",
    label: "Category",
    kind: "select",
    required: true,
    options: [
      { value: "hair-oil", label: "Hair Oil" },
      { value: "hair-serum", label: "Hair Serum" },
      { value: "shampoo", label: "Shampoo" },
      { value: "conditioner", label: "Conditioner" },
      { value: "hair-kit", label: "Hair Kit" },
      { value: "skin-care", label: "Skin Care" },
      { value: "medicine", label: "Medicine" },
      { value: "supplements", label: "Supplements" },
    ],
  },
  {
    name: "image",
    label: "Product photo",
    kind: "image",
    hint: "Square images (around 1200×1200) work best. Shown on shop cards and the product page.",
  },
  { name: "tagline", label: "Tagline", kind: "text", required: true },
  { name: "description", label: "Description", kind: "textarea", required: true },
  { name: "price", label: "Price (₹)", kind: "price", required: true },
  {
    name: "compareAtPrice",
    label: "Compare-at price (₹)",
    kind: "price",
    hint: "Optional. Shown struck through; leave 0 for none.",
  },
  { name: "size", label: "Pack size", kind: "text", required: true },
  { name: "inStock", label: "In stock", kind: "toggle" },
  { name: "featured", label: "Featured on homepage", kind: "toggle" },
  { name: "bestseller", label: "Bestseller badge", kind: "toggle" },
  { name: "benefits", label: "Benefits", kind: "lines", hint: "One per line. Support claims only — never cures." },
  {
    name: "ingredients",
    label: "Ingredients",
    kind: "repeater",
    fields: [
      { name: "name", label: "Ingredient", kind: "text" },
      { name: "role", label: "Role", kind: "text" },
    ],
  },
  { name: "directions", label: "Directions", kind: "lines", hint: "One step per line." },
  {
    name: "caution",
    label: "Safety information",
    kind: "textarea",
    required: true,
    hint: "Shown verbatim on the product page. Do not weaken this copy.",
  },
];

const postFields: FieldDef[] = [
  { name: "title", label: "Title", kind: "text", required: true },
  {
    name: "category",
    label: "Category",
    kind: "select",
    required: true,
    options: [
      { value: "hair-tips", label: "Hair Tips" },
      { value: "homeopathy", label: "Homeopathy" },
      { value: "nutrition", label: "Nutrition" },
      { value: "lifestyle", label: "Lifestyle" },
      { value: "womens-health", label: "Women's Health" },
      { value: "children", label: "Children" },
    ],
  },
  {
    name: "image",
    label: "Cover image",
    kind: "image",
    hint: "Wide images (around 1600×1000) work best. Shown on blog cards and at the top of the article.",
  },
  { name: "excerpt", label: "Excerpt", kind: "textarea", required: true },
  {
    name: "publishedAt",
    label: "Publish date",
    kind: "text",
    required: true,
    hint: "YYYY-MM-DD",
  },
  { name: "readingMinutes", label: "Reading minutes", kind: "number" },
  { name: "featured", label: "Featured", kind: "toggle" },
  {
    name: "body",
    label: "Article body",
    kind: "repeater",
    hint: "Blocks render in order. For list blocks, put one item per line in the items box; other blocks use the text box.",
    fields: [
      {
        name: "type",
        label: "Block type",
        kind: "select",
        options: [
          { value: "paragraph", label: "Paragraph" },
          { value: "heading", label: "Heading" },
          { value: "list", label: "Bullet list" },
          { value: "callout", label: "Callout" },
        ],
      },
      { name: "text", label: "Text (paragraph / heading / callout)", kind: "textarea" },
      { name: "items", label: "Items (list blocks only)", kind: "lines" },
    ],
  },
];

const testimonialFields: FieldDef[] = [
  { name: "author", label: "Patient name (as displayed)", kind: "text", required: true },
  { name: "location", label: "Location", kind: "text" },
  {
    name: "quote",
    label: "Quote",
    kind: "textarea",
    required: true,
    hint: "Describe the experience of care, never a treatment outcome — see the compliance note in README.",
  },
  { name: "context", label: "Context line", kind: "text", hint: 'e.g. "Consulting since 2025 · Hair fall"' },
  {
    name: "consentOnFile",
    label: "Written consent on file",
    kind: "toggle",
    hint: "Do not publish a real quote without signed consent.",
  },
];

const faqFields: FieldDef[] = [
  {
    name: "items",
    label: "Homepage FAQs",
    kind: "repeater",
    fields: [
      { name: "question", label: "Question", kind: "text" },
      { name: "answer", label: "Answer", kind: "textarea" },
    ],
  },
];

/**
 * The doctor document is nested ({ biography: {...}, mission: {...} }); the
 * form works on this flat shape and actions.ts maps between the two.
 */
const doctorFields: FieldDef[] = [
  {
    name: "bioIntro",
    label: "Introduction",
    kind: "textarea",
    required: true,
    hint: "Also used as the About page subtitle.",
  },
  {
    name: "bioParagraphs",
    label: "Biography paragraphs",
    kind: "lines",
    hint: "One paragraph per line.",
  },
  { name: "missionText", label: "Mission", kind: "textarea" },
  { name: "visionText", label: "Vision", kind: "textarea" },
  {
    name: "values",
    label: "Values",
    kind: "repeater",
    fields: [
      { name: "title", label: "Title", kind: "text" },
      { name: "detail", label: "Detail", kind: "textarea" },
    ],
  },
  {
    name: "education",
    label: "Education",
    kind: "repeater",
    fields: [
      { name: "year", label: "Year", kind: "text" },
      { name: "qualification", label: "Qualification", kind: "text" },
      { name: "institution", label: "Institution", kind: "text" },
      { name: "detail", label: "Detail", kind: "textarea" },
    ],
  },
  {
    name: "timeline",
    label: "Practice timeline",
    kind: "repeater",
    fields: [
      { name: "year", label: "Year", kind: "text" },
      { name: "title", label: "Title", kind: "text" },
      { name: "detail", label: "Detail", kind: "textarea" },
    ],
  },
  {
    name: "achievements",
    label: "Achievements",
    kind: "repeater",
    fields: [
      { name: "title", label: "Title", kind: "text" },
      { name: "detail", label: "Detail", kind: "textarea" },
    ],
  },
];


const galleryFields: FieldDef[] = [
  {
    name: "items",
    label: "Clinic photos",
    kind: "repeater",
    hint: "Shown in the About page's \"Where consultations happen\" gallery, in this order. Never upload a patient photo without written consent.",
    fields: [
      { name: "image", label: "Photo", kind: "image" },
      { name: "label", label: "Caption", kind: "text" },
    ],
  },
];

const consultationFields: FieldDef[] = [
  {
    name: "prepare",
    label: '"What to have ready" items',
    kind: "repeater",
    hint: "Shown on the consultation page under Before your appointment.",
    fields: [
      { name: "title", label: "Title", kind: "text" },
      { name: "detail", label: "Detail", kind: "textarea" },
    ],
  },
  {
    name: "deliveryNote",
    label: "Medicine delivery note",
    kind: "textarea",
    hint: "The paragraph under Medicine delivery on the consultation page.",
  },
];

const clinicFields: FieldDef[] = [
  {
    name: "phone",
    label: "Phone number",
    kind: "text",
    required: true,
    hint: "10-digit mobile. Used across the site — header, footer, contact page, tap-to-call.",
  },
  { name: "whatsapp", label: "WhatsApp number", kind: "text", required: true },
  { name: "email", label: "Email", kind: "text", required: true },
  { name: "addressLine1", label: "Address line 1", kind: "text" },
  { name: "addressLine2", label: "Address line 2", kind: "text" },
  { name: "city", label: "Town / city", kind: "text" },
  { name: "district", label: "District", kind: "text" },
  { name: "state", label: "State", kind: "text" },
  { name: "postalCode", label: "PIN code", kind: "text" },
  {
    name: "hours",
    label: "Consultation hours",
    kind: "repeater",
    fields: [
      { name: "days", label: "Days", kind: "text" },
      { name: "time", label: "Time", kind: "text" },
    ],
  },
  {
    name: "mapQuery",
    label: "Map search override",
    kind: "text",
    hint: "Optional. Exact Google Maps search text for the map pin; leave blank to use the address above.",
  },
  {
    name: "stats",
    label: "Homepage statistics",
    kind: "repeater",
    hint: "The counters on the homepage. Every figure must be verifiable from clinic records — see README § Compliance.",
    fields: [
      { name: "value", label: "Number", kind: "number" },
      { name: "suffix", label: "Suffix (e.g. +)", kind: "text" },
      { name: "label", label: "Label", kind: "text" },
    ],
  },
];

export const collections: CollectionDef[] = [
  {
    key: "conditions",
    label: "Treatments & Conditions",
    noun: "condition",
    kind: "collection",
    titleField: "name",
    subtitleField: "summary",
    fields: conditionFields,
  },
  {
    key: "products",
    label: "Shop Products",
    noun: "product",
    kind: "collection",
    titleField: "name",
    subtitleField: "tagline",
    fields: productFields,
  },
  {
    key: "posts",
    label: "Blog Posts",
    noun: "post",
    kind: "collection",
    titleField: "title",
    subtitleField: "excerpt",
    fields: postFields,
  },
  {
    key: "testimonials",
    label: "Testimonials",
    noun: "testimonial",
    kind: "collection",
    titleField: "author",
    subtitleField: "quote",
    fields: testimonialFields,
  },
  {
    key: "faqs",
    label: "Homepage FAQs",
    noun: "FAQ set",
    kind: "singleton",
    titleField: "question",
    fields: faqFields,
  },
  {
    key: "doctor",
    label: "Doctor Profile",
    noun: "profile",
    kind: "singleton",
    titleField: "intro",
    fields: doctorFields,
  },
  {
    key: "gallery",
    label: "Clinic Photos",
    noun: "gallery",
    kind: "singleton",
    titleField: "label",
    fields: galleryFields,
  },
  {
    key: "consultation",
    label: "Consultation Page",
    noun: "page",
    kind: "singleton",
    titleField: "title",
    fields: consultationFields,
  },
  {
    key: "clinic",
    label: "Clinic & Contact",
    noun: "settings",
    kind: "singleton",
    titleField: "phone",
    fields: clinicFields,
  },
];

export function getCollection(key: string): CollectionDef | undefined {
  return collections.find((c) => c.key === key);
}
