/**
 * Product catalogue. Prices are in paise (₹1 = 100) so all arithmetic stays in
 * integers — never store currency as a float.
 *
 * Admin-editable: reads content/products.json when present, else these
 * in-code defaults. Types and labels live in product-types.ts (client-safe).
 *
 * COPY POLICY: these are cosmetic hair and skin care products, not licensed
 * drugs. Benefit copy describes what the product supports, never what it cures.
 */

import { readDoc } from "@/lib/admin/store";
import {
  categoryLabels,
  categoryOrder,
  type Product,
  type ProductCategory,
} from "./product-types";

export { categoryLabels, categoryOrder };
export type { Product, ProductCategory };

const defaults: Product[] = [
  {
    slug: "root-revival-hair-oil",
    name: "Root Revival Hair Oil",
    category: "hair-oil",
    tagline: "Cold-pressed botanical oil for scalp conditioning",
    description:
      "A lightweight, non-sticky scalp oil formulated in the clinic for daily-use hair care. Built on a cold-pressed coconut and sesame base infused with bhringraj, brahmi and rosemary, it is intended to condition the scalp and reduce breakage from dryness. Formulated by Dr. Riji Rasheed as a supportive companion to treatment, not a replacement for it.",
    price: 64500,
    compareAtPrice: 79500,
    size: "200 ml",
    inStock: true,
    featured: true,
    bestseller: true,
    benefits: [
      "Conditions a dry, flaking scalp",
      "Reduces breakage caused by dryness and rough handling",
      "Light texture that washes out without repeated shampooing",
      "Free from mineral oil, artificial fragrance and synthetic colour",
    ],
    ingredients: [
      { name: "Cold-pressed coconut oil", role: "Base — reduces protein loss from the hair shaft" },
      { name: "Sesame oil", role: "Base — conditions and adds slip" },
      { name: "Bhringraj (Eclipta alba)", role: "Traditionally used in scalp preparations" },
      { name: "Brahmi (Bacopa monnieri)", role: "Traditionally used for scalp conditioning" },
      { name: "Rosemary essential oil", role: "Aromatic; supports scalp comfort" },
      { name: "Vitamin E (tocopherol)", role: "Natural antioxidant, keeps the oil stable" },
    ],
    directions: [
      "Section dry hair and apply directly to the scalp, not the lengths.",
      "Massage with fingertips — never nails — for three to five minutes.",
      "Leave for at least one hour, or overnight if your scalp is not oily.",
      "Wash out with a mild shampoo. Twice weekly is sufficient.",
    ],
    caution:
      "For external use only. Patch test on the inner forearm 24 hours before first use. Discontinue if irritation occurs. Keep away from eyes and out of reach of children. Not a treatment for any medical condition — consult the clinic if you have active scalp disease.",
    rating: { value: 4.7, count: 213 },
    reviews: [
      {
        author: "Meera S.",
        location: "Thiruvananthapuram",
        rating: 5,
        date: "2026-05-14",
        title: "Finally an oil that isn't heavy",
        body: "I stopped oiling entirely because everything left my hair greasy for days. This one washes out with a single wash. My scalp feels much less tight and itchy.",
      },
      {
        author: "Anjali R.",
        location: "Kollam",
        rating: 4,
        date: "2026-04-28",
        title: "Good, but give it time",
        body: "Used it for three months alongside my consultation. My scalp dryness improved quite early. The shedding took longer to settle and honestly I think that was the medicines more than the oil.",
      },
      {
        author: "Fathima N.",
        location: "Kattakkada",
        rating: 5,
        date: "2026-03-09",
        title: "The smell is lovely",
        body: "No artificial perfume, just the herbs and rosemary. My daughter uses it too and she never tolerated the shop-bought ones.",
      },
    ],
    related: ["clarify-scalp-shampoo", "daily-strength-serum", "complete-hair-care-kit"],
  },
  {
    slug: "daily-strength-serum",
    name: "Daily Strength Scalp Serum",
    category: "hair-serum",
    tagline: "Leave-in serum for thinning at the parting and crown",
    description:
      "A fast-absorbing, water-light leave-in serum applied directly to the scalp. Combines rosemary and peppermint with panthenol and niacinamide in a non-greasy base, designed for daily use on areas where density has reduced. Leaves no residue and can be used under styling.",
    price: 89500,
    size: "50 ml",
    inStock: true,
    featured: true,
    bestseller: true,
    benefits: [
      "Absorbs in seconds with no greasy residue",
      "Formulated for the parting and crown specifically",
      "Panthenol supports hair-shaft moisture retention",
      "Suitable for daily use, including on styled hair",
    ],
    ingredients: [
      { name: "Rosemary leaf extract", role: "Aromatic scalp conditioner" },
      { name: "Niacinamide (vitamin B3)", role: "Supports the scalp skin barrier" },
      { name: "Panthenol (pro-vitamin B5)", role: "Humectant — helps retain moisture" },
      { name: "Peppermint oil", role: "Provides a light cooling sensation" },
      { name: "Caffeine", role: "Common cosmetic scalp ingredient" },
      { name: "Aloe barbadensis", role: "Soothing base" },
    ],
    directions: [
      "Apply to a clean, dry or towel-dried scalp.",
      "Part the hair and apply four to six drops directly along the parting and crown.",
      "Massage in gently with fingertips. Do not rinse.",
      "Use once daily, preferably at night.",
    ],
    caution:
      "For external use only. Contains peppermint oil — a mild tingling sensation is normal, but stop use if it burns. Patch test before first use. Avoid contact with eyes. Not suitable for broken or actively inflamed skin. Not recommended during pregnancy without consulting the clinic.",
    rating: { value: 4.6, count: 168 },
    reviews: [
      {
        author: "Divya K.",
        location: "Neyyattinkara",
        rating: 5,
        date: "2026-06-02",
        title: "No greasiness at all",
        body: "I can use this before work which was never possible with oil. The cooling feeling is pleasant. My parting looks better in photos after about five months but I was also on treatment.",
      },
      {
        author: "Sreelakshmi P.",
        location: "Thiruvananthapuram",
        rating: 4,
        date: "2026-05-21",
        title: "Works but be patient",
        body: "Nothing happened for the first two months and I nearly stopped. Dr. Riji told me at my follow-up to continue. Glad I did.",
      },
    ],
    related: ["root-revival-hair-oil", "complete-hair-care-kit", "biotin-plus-supplement"],
  },
  {
    slug: "clarify-scalp-shampoo",
    name: "Clarify Anti-Dandruff Shampoo",
    category: "shampoo",
    tagline: "Gentle sulphate-free cleanser for flaking, itchy scalps",
    description:
      "A sulphate-free shampoo formulated for scalps prone to flaking and itching. Uses a mild coconut-derived surfactant system with ketoconazole-free botanicals, so it cleanses without stripping. Suitable for frequent use and for colour-treated hair.",
    price: 54500,
    size: "250 ml",
    inStock: true,
    featured: true,
    benefits: [
      "Sulphate-free — cleanses without stripping the scalp",
      "Formulated for frequent use, up to four times weekly",
      "Helps reduce visible flaking with regular use",
      "Safe for colour-treated and chemically processed hair",
    ],
    ingredients: [
      { name: "Coco-glucoside", role: "Mild coconut-derived cleansing agent" },
      { name: "Tea tree oil", role: "Traditionally used for scalp cleanliness" },
      { name: "Salicylic acid (0.5%)", role: "Helps loosen surface flaking" },
      { name: "Neem extract", role: "Traditional scalp botanical" },
      { name: "Glycerin", role: "Humectant, prevents over-drying" },
    ],
    directions: [
      "Wet hair thoroughly with lukewarm — not hot — water.",
      "Apply to the scalp and lather gently with fingertips.",
      "Leave on the scalp for two to three minutes before rinsing.",
      "Rinse completely. Follow with conditioner on the lengths only.",
    ],
    caution:
      "For external use only. Contains salicylic acid — avoid if you have a known salicylate sensitivity. Avoid contact with eyes; rinse thoroughly with water if contact occurs. Discontinue if irritation develops. Not for use on broken skin.",
    rating: { value: 4.5, count: 142 },
    reviews: [
      {
        author: "Rahul M.",
        location: "Kattakkada",
        rating: 5,
        date: "2026-06-11",
        title: "Itching stopped in two weeks",
        body: "I had been using a strong medicated shampoo that left my hair like straw. This cleans well and my hair actually feels soft. Flaking took about a month to reduce properly.",
      },
      {
        author: "Nithya J.",
        location: "Kochi",
        rating: 4,
        date: "2026-04-17",
        title: "Doesn't lather much",
        body: "Took getting used to since it is sulphate-free, but it does the job. My coloured hair has not faded which was my main worry.",
      },
    ],
    related: ["silk-repair-conditioner", "root-revival-hair-oil", "complete-hair-care-kit"],
  },
  {
    slug: "silk-repair-conditioner",
    name: "Silk Repair Conditioner",
    category: "conditioner",
    tagline: "Lightweight conditioner for detangling without weight",
    description:
      "A lightweight rinse-out conditioner for the mid-lengths and ends. Formulated to reduce mechanical breakage during combing — one of the most common and most overlooked causes of hair loss — without weighing fine hair down.",
    price: 49500,
    size: "250 ml",
    inStock: true,
    benefits: [
      "Significantly reduces breakage during combing",
      "Light enough for fine hair",
      "Contains no silicones that build up over time",
      "Leaves hair easier to manage when wet",
    ],
    ingredients: [
      { name: "Cetearyl alcohol", role: "Fatty alcohol — conditioning, not drying" },
      { name: "Shea butter", role: "Softens and smooths the cuticle" },
      { name: "Hydrolysed rice protein", role: "Supports hair-shaft strength" },
      { name: "Argan oil", role: "Adds slip and shine" },
      { name: "Aloe vera", role: "Lightweight hydration" },
    ],
    directions: [
      "After shampooing, squeeze excess water from the hair.",
      "Apply from mid-length to ends only — avoid the scalp.",
      "Leave for two minutes, then rinse with cool water.",
      "Detangle with a wide-tooth comb while the conditioner is still in.",
    ],
    caution:
      "For external use only. Avoid contact with eyes. Discontinue if irritation occurs. Apply to lengths only — application at the scalp may aggravate an oily or flaking scalp.",
    rating: { value: 4.6, count: 97 },
    reviews: [
      {
        author: "Aparna V.",
        location: "Thiruvananthapuram",
        rating: 5,
        date: "2026-05-30",
        title: "Much less hair in the comb",
        body: "I did not realise how much of my hair fall was actually breakage from combing wet hair. Detangling with this in the shower made an immediate difference.",
      },
    ],
    related: ["clarify-scalp-shampoo", "root-revival-hair-oil", "complete-hair-care-kit"],
  },
  {
    slug: "complete-hair-care-kit",
    name: "Complete Hair Care Kit",
    category: "hair-kit",
    tagline: "The full four-step routine, at a saving",
    description:
      "The complete clinic routine in one box: Root Revival Hair Oil, Clarify Anti-Dandruff Shampoo, Silk Repair Conditioner and Daily Strength Scalp Serum, with a printed routine card. This is the regimen most commonly recommended alongside consultation, bundled at a saving over buying each item separately.",
    price: 219500,
    compareAtPrice: 258000,
    size: "4-piece set",
    inStock: true,
    featured: true,
    bestseller: true,
    benefits: [
      "The complete routine, correctly sequenced",
      "Saves over ₹380 against individual purchase",
      "Includes a printed weekly routine card",
      "Approximately three months of use for average hair length",
    ],
    ingredients: [
      { name: "Root Revival Hair Oil", role: "200 ml — twice-weekly scalp conditioning" },
      { name: "Clarify Anti-Dandruff Shampoo", role: "250 ml — cleansing" },
      { name: "Silk Repair Conditioner", role: "250 ml — lengths and ends" },
      { name: "Daily Strength Scalp Serum", role: "50 ml — daily leave-in" },
    ],
    directions: [
      "Follow the enclosed routine card.",
      "Twice weekly: oil, leave one hour or overnight, then shampoo and condition.",
      "On non-wash days: apply the serum to the scalp at night.",
      "Introduce one product at a time if you have sensitive skin.",
    ],
    caution:
      "For external use only. Read the individual caution on each product before use. Patch test each item separately. Discontinue any product that causes irritation and consult the clinic.",
    rating: { value: 4.8, count: 156 },
    reviews: [
      {
        author: "Lakshmi G.",
        location: "Kattakkada",
        rating: 5,
        date: "2026-06-18",
        title: "Simpler than buying separately",
        body: "The routine card is genuinely useful. I was oiling wrongly for years — leaving it on for three days thinking more was better.",
      },
      {
        author: "Sunitha B.",
        location: "Kollam",
        rating: 5,
        date: "2026-05-05",
        title: "Good value",
        body: "Bought after my second follow-up. Lasted almost exactly three months as stated.",
      },
    ],
    related: ["root-revival-hair-oil", "daily-strength-serum", "clarify-scalp-shampoo"],
  },
  {
    slug: "calendula-face-cleanser",
    name: "Calendula Gentle Face Cleanser",
    category: "skin-care",
    tagline: "Soap-free cleanser for sensitive and reactive skin",
    description:
      "A soap-free, pH-balanced facial cleanser built around calendula and chamomile for skin that reacts easily. Removes sunscreen and daily grime without the tight, stripped feeling that drives excess oil production.",
    price: 47500,
    size: "150 ml",
    inStock: true,
    benefits: [
      "Soap-free and pH balanced at 5.5",
      "Removes sunscreen without harsh surfactants",
      "Suitable for sensitive and eczema-prone skin",
      "Free from added fragrance and essential oils",
    ],
    ingredients: [
      { name: "Calendula officinalis extract", role: "Traditionally used for sensitive skin" },
      { name: "Chamomile extract", role: "Soothing botanical" },
      { name: "Glycerin", role: "Humectant" },
      { name: "Coco-betaine", role: "Mild cleansing agent" },
      { name: "Allantoin", role: "Skin-conditioning agent" },
    ],
    directions: [
      "Apply to damp skin morning and evening.",
      "Massage gently for thirty seconds.",
      "Rinse with lukewarm water and pat dry — do not rub.",
      "Follow with moisturiser while skin is still slightly damp.",
    ],
    caution:
      "For external use only. Avoid contact with eyes. Patch test before first use if you have reactive skin. Discontinue if irritation occurs. Not a treatment for any diagnosed skin condition.",
    rating: { value: 4.5, count: 74 },
    reviews: [
      {
        author: "Reshma T.",
        location: "Thiruvananthapuram",
        rating: 5,
        date: "2026-04-22",
        title: "No tightness afterwards",
        body: "My skin flares with almost every cleanser. This one has been fine for four months.",
      },
    ],
    related: ["neem-clarifying-gel", "root-revival-hair-oil"],
  },
  {
    slug: "neem-clarifying-gel",
    name: "Neem Clarifying Gel",
    category: "skin-care",
    tagline: "Lightweight gel for oily and blemish-prone skin",
    description:
      "An oil-free gel moisturiser for skin that is oily but still needs hydration. Neem and witch hazel in a non-comedogenic base, formulated to sit comfortably under sunscreen in humid weather.",
    price: 52500,
    size: "100 ml",
    inStock: false,
    benefits: [
      "Oil-free and non-comedogenic",
      "Suited to humid coastal weather",
      "Layers well under sunscreen",
      "No added fragrance",
    ],
    ingredients: [
      { name: "Neem extract", role: "Traditional botanical for oily skin" },
      { name: "Witch hazel", role: "Astringent botanical" },
      { name: "Niacinamide", role: "Supports the skin barrier" },
      { name: "Hyaluronic acid", role: "Oil-free hydration" },
      { name: "Zinc PCA", role: "Helps manage surface oil" },
    ],
    directions: [
      "Apply to clean skin morning and evening.",
      "Use a pea-sized amount for the whole face.",
      "Allow to absorb fully before applying sunscreen.",
    ],
    caution:
      "For external use only. Avoid contact with eyes. Patch test before first use. Discontinue if irritation occurs. Consult the clinic before use alongside prescription acne treatment.",
    rating: { value: 4.4, count: 61 },
    reviews: [
      {
        author: "Arun P.",
        location: "Kochi",
        rating: 4,
        date: "2026-03-30",
        title: "Good for the humidity here",
        body: "Does not feel heavy even in June. Wish the bottle were larger.",
      },
    ],
    related: ["calendula-face-cleanser"],
  },
  {
    slug: "biotin-plus-supplement",
    name: "Biotin Plus Hair Supplement",
    category: "supplements",
    tagline: "Biotin, zinc and selenium in a once-daily tablet",
    description:
      "A once-daily nutritional supplement providing biotin, zinc, selenium and vitamin D3. Intended to support normal hair maintenance where dietary intake is inadequate. It is a supplement, not a medicine, and it is not a substitute for correcting a diagnosed deficiency under supervision.",
    price: 74500,
    size: "60 tablets",
    inStock: true,
    benefits: [
      "Biotin contributes to the maintenance of normal hair",
      "Zinc and selenium contribute to normal hair and nails",
      "Vitamin D3 included — deficiency is widespread in India",
      "One tablet daily, vegetarian-suitable",
    ],
    ingredients: [
      { name: "Biotin (vitamin B7) 5000 mcg", role: "Contributes to normal hair maintenance" },
      { name: "Zinc 12 mg", role: "Contributes to normal hair and nails" },
      { name: "Selenium 55 mcg", role: "Contributes to normal hair" },
      { name: "Vitamin D3 1000 IU", role: "Supports normal immune function" },
      { name: "Vitamin B12 2.4 mcg", role: "Supports normal red blood cell formation" },
    ],
    directions: [
      "One tablet daily with food, preferably at the same time each day.",
      "Do not exceed the stated dose.",
      "Continue for at least three months for nutritional support to be meaningful.",
    ],
    caution:
      "A food supplement, not a medicine, and not a substitute for a varied diet. Not recommended during pregnancy or breastfeeding without medical advice. Tell your doctor you are taking biotin before any blood test — high-dose biotin is well documented to interfere with thyroid and cardiac laboratory assays. Keep out of reach of children.",
    rating: { value: 4.3, count: 118 },
    reviews: [
      {
        author: "Priya D.",
        location: "Neyyattinkara",
        rating: 4,
        date: "2026-05-12",
        title: "Nails improved first",
        body: "My nails were noticeably stronger within about six weeks. Hair took much longer and I cannot say how much was this versus the treatment.",
      },
      {
        author: "Vishnu S.",
        location: "Thiruvananthapuram",
        rating: 5,
        date: "2026-02-19",
        title: "Doctor warned me about the blood test",
        body: "Useful point — I was told to stop three days before my thyroid test. Good that it is on the label too.",
      },
    ],
    related: ["daily-strength-serum", "complete-hair-care-kit"],
  },
  {
    slug: "hair-fall-drops",
    name: "Hair Support Drops",
    category: "medicine",
    tagline: "Homeopathic drops — dispensed with consultation",
    description:
      "A homeopathic preparation dispensed by the clinic as part of a treatment plan. Because homeopathic prescribing is individualised to the person rather than the complaint, this is available only to patients who have completed a consultation. Add it to your order and the clinic will confirm suitability against your record before dispatch.",
    price: 39500,
    size: "30 ml",
    inStock: true,
    benefits: [
      "Dispensed only after individual assessment",
      "Prepared to the clinic's specification",
      "Dosage set for you at consultation",
      "Reviewed at each follow-up",
    ],
    ingredients: [
      { name: "Individualised", role: "The composition is determined by your consultation" },
    ],
    directions: [
      "Take exactly as directed at your consultation — dosage is individual.",
      "Do not share with family members, even with similar symptoms.",
      "Take fifteen minutes away from food, coffee and strong flavours.",
      "Report any new or unexpected symptom at your follow-up.",
    ],
    caution:
      "Available to consulting patients only. Homeopathic treatment does not replace conventional medical care, and no prescribed conventional medication should be stopped or altered without the advice of the physician who prescribed it. In a medical emergency, seek immediate hospital care. Keep out of reach of children.",
    rating: { value: 4.7, count: 89 },
    reviews: [
      {
        author: "Verified patient",
        location: "Kattakkada",
        rating: 5,
        date: "2026-06-08",
        title: "Follow-up process is good",
        body: "The dosage was changed at my second follow-up based on how I responded. It does not feel like an off-the-shelf product.",
      },
    ],
    related: ["root-revival-hair-oil", "biotin-plus-supplement"],
  },
];

/* ---------------------------------------------------------------- accessors */

function load(): Promise<Product[]> {
  return readDoc<Product[]>("products", defaults);
}

export async function getProducts(): Promise<Product[]> {
  return load();
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return (await load()).filter((p) => p.featured);
}

export async function getProductsByCategory(
  category: ProductCategory,
): Promise<Product[]> {
  return (await load()).filter((p) => p.category === category);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  return (await load()).find((p) => p.slug === slug);
}

export async function getProductSlugs(): Promise<string[]> {
  return (await load()).map((p) => p.slug);
}

export async function getRelatedProducts(slug: string): Promise<Product[]> {
  const products = await load();
  const product = products.find((p) => p.slug === slug);
  if (!product) return [];
  return product.related
    .map((related) => products.find((p) => p.slug === related))
    .filter((p): p is Product => Boolean(p));
}

/** Categories that actually have stock, for the shop filter bar. */
export async function getActiveCategories(): Promise<ProductCategory[]> {
  const present = new Set((await load()).map((p) => p.category));
  return categoryOrder.filter((category) => present.has(category));
}

/** The raw defaults, used by the admin panel to seed first-time edits. */
export function getProductDefaults(): Product[] {
  return structuredClone(defaults);
}
