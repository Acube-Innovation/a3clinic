/**
 * Blog posts. Body content is authored as an ordered block array rather than
 * raw HTML so it renders through typed components and can move to a CMS later
 * without a rewrite.
 */

export type PostCategory =
  | "hair-tips"
  | "homeopathy"
  | "nutrition"
  | "lifestyle"
  | "womens-health"
  | "children";

export const postCategoryLabels: Record<PostCategory, string> = {
  "hair-tips": "Hair Tips",
  homeopathy: "Homeopathy",
  nutrition: "Nutrition",
  lifestyle: "Lifestyle",
  "womens-health": "Women's Health",
  children: "Children",
};

export type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; text: string };

export type Post = {
  slug: string;
  title: string;
  category: PostCategory;
  /** Cover image uploaded via admin; site falls back to placeholder art. */
  image?: string;
  excerpt: string;
  publishedAt: string;
  readingMinutes: number;
  featured?: boolean;
  body: Block[];
};

import { readDoc } from "@/lib/admin/store";

const defaults: Post[] = [
  {
    slug: "how-much-hair-fall-is-normal",
    title: "How much hair fall is actually normal?",
    category: "hair-tips",
    excerpt:
      "Almost every hair consultation starts with the same question. The honest answer involves a number, but the number matters less than the pattern.",
    publishedAt: "2026-06-24",
    readingMinutes: 6,
    featured: true,
    body: [
      {
        type: "paragraph",
        text: "Losing between fifty and a hundred hairs a day is normal. That figure gets quoted constantly, and it is broadly accurate — but on its own it is close to useless, because almost nobody counts, and the number varies enormously depending on how often you wash your hair.",
      },
      {
        type: "paragraph",
        text: "If you wash twice a week, the hairs that would have shed on the other days come out together in the shower. Fifty a day becomes a hundred and seventy in one wash, and that looks alarming when it is sitting in the drain. It is the same amount of hair.",
      },
      { type: "heading", text: "What actually matters" },
      {
        type: "paragraph",
        text: "Rather than counting, look at these four things — they tell you far more than any daily figure.",
      },
      {
        type: "list",
        items: [
          "Density, not shedding. Has your parting widened over the last year? Is your ponytail thinner when you tie it? Shedding without density loss is usually not a problem.",
          "The root. A shed hair with a small white bulb has completed its natural cycle. A hair that broke mid-shaft is breakage — a hair-care problem, not a follicle problem.",
          "Duration. Shedding for two or three weeks after an illness, fever or stressful period is expected and self-limiting. Shedding continuously for more than three months is worth investigating.",
          "New hair. Part your hair and look closely at the scalp near the hairline. Short, fine hairs standing up are new growth, and a good sign.",
        ],
      },
      { type: "heading", text: "When to get it checked" },
      {
        type: "paragraph",
        text: "Book a consultation if shedding has continued beyond three months, if your parting has visibly widened, if you have distinct patches rather than diffuse thinning, or if there are other symptoms alongside — fatigue, weight change, irregular periods. Those combinations often point to something systemic and correctable.",
      },
      {
        type: "callout",
        text: "Sudden patchy loss with clearly defined smooth edges is different from gradual thinning and should be assessed promptly rather than watched for months.",
      },
      { type: "heading", text: "The three-month rule" },
      {
        type: "paragraph",
        text: "Hair grows roughly one centimetre a month, and a shed hair takes around three months to be visibly replaced. This cuts both ways. It means a shedding episode you notice today was often triggered by something that happened three months ago — an illness, a crash diet, a delivery. It also means no treatment, of any kind, can show visible results faster than the hair can physically grow. Anyone promising results in three weeks is not describing biology.",
      },
    ],
  },
  {
    slug: "thyroid-and-hair-loss",
    title: "The thyroid connection most people miss",
    category: "womens-health",
    excerpt:
      "Diffuse thinning across the whole scalp, with loss of the outer third of the eyebrow, is a pattern worth recognising — and one blood test away from an answer.",
    publishedAt: "2026-06-10",
    readingMinutes: 5,
    featured: true,
    body: [
      {
        type: "paragraph",
        text: "Thyroid hormone regulates how quickly cells divide, and hair follicles are among the fastest-dividing cells in the body. When thyroid function drops, follicles are affected early — often before the more familiar symptoms of weight gain and fatigue become obvious enough to act on.",
      },
      { type: "heading", text: "The pattern to look for" },
      {
        type: "paragraph",
        text: "Thyroid-related hair loss is characteristically diffuse. Hair thins evenly across the whole scalp rather than in patches or at a receding hairline. The most distinctive sign is loss of the outer third of the eyebrow — this has been recognised clinically for decades and is easy to spot in a mirror.",
      },
      {
        type: "list",
        items: [
          "Even thinning across the entire scalp rather than a defined pattern",
          "Loss of the outer third of the eyebrows",
          "Hair that feels dry, coarse or brittle",
          "Fatigue that sleep does not resolve",
          "Cold intolerance, constipation, or unexplained weight change",
          "Irregular or heavier menstrual periods",
        ],
      },
      { type: "heading", text: "Get the right tests" },
      {
        type: "paragraph",
        text: "A TSH alone is a reasonable screen but not a complete picture. Free T3, free T4 and — where autoimmune thyroid disease is suspected — anti-TPO antibodies give considerably more information. If you have a family history of thyroid disease, mention it, because it changes how borderline results are interpreted.",
      },
      {
        type: "callout",
        text: "If you take a high-dose biotin supplement, stop it at least three days before any thyroid blood test. Biotin is well documented to interfere with these assays and can produce results that look convincingly abnormal when your thyroid is entirely normal.",
      },
      { type: "heading", text: "What recovery looks like" },
      {
        type: "paragraph",
        text: "Hair recovery lags behind blood results, usually by three to six months. This is the single most common source of frustration: the reports normalise, and the hair has not caught up yet. That gap is expected. It is not a sign that treatment has failed.",
      },
    ],
  },
  {
    slug: "oiling-hair-correctly",
    title: "You are probably oiling your hair wrong",
    category: "hair-tips",
    excerpt:
      "Oiling is deeply embedded in how we care for hair here. Done badly, it can make dandruff and shedding measurably worse.",
    publishedAt: "2026-05-27",
    readingMinutes: 4,
    body: [
      {
        type: "paragraph",
        text: "Coconut oil is one of the few hair oils with reasonable evidence behind it — it penetrates the hair shaft and reduces protein loss during washing. The oil is rarely the problem. How it is used usually is.",
      },
      { type: "heading", text: "Five common mistakes" },
      {
        type: "list",
        items: [
          "Leaving oil in for days. On an oily or flaking scalp this feeds Malassezia yeast, which is exactly what drives dandruff. One hour to overnight is plenty.",
          "Vigorous massage. Rubbing hard tangles hair and causes mechanical breakage. Use fingertips, not nails, and moderate pressure.",
          "Oiling the lengths and skipping the scalp. The scalp is where oil does its work. The ends mainly need it as protection before washing.",
          "Double shampooing to remove it. If you need two or three washes to get the oil out, you applied too much. Stripping the scalp that way makes dryness worse.",
          "Oiling an inflamed scalp. If your scalp is red, sore or actively flaking, oil traps heat and moisture and often aggravates it. Get it assessed first.",
        ],
      },
      { type: "heading", text: "A routine that works" },
      {
        type: "paragraph",
        text: "Twice a week, apply a moderate amount to a dry scalp in sections. Massage with fingertips for three to five minutes. Leave for an hour, or overnight if your scalp is dry rather than oily. Wash out with a mild shampoo, lathering at the scalp and letting the runoff clean the lengths. That is the whole method.",
      },
      {
        type: "callout",
        text: "If your scalp is oily and flaking, less oil rather than more is usually the correct answer. This runs against most received wisdom, which is exactly why it is worth stating plainly.",
      },
    ],
  },
  {
    slug: "iron-deficiency-hair",
    title: "Iron, ferritin, and why your haemoglobin looked fine",
    category: "nutrition",
    excerpt:
      "A normal haemoglobin does not rule out iron deficiency. For hair, ferritin is the number that matters — and it is often not tested.",
    publishedAt: "2026-05-13",
    readingMinutes: 5,
    body: [
      {
        type: "paragraph",
        text: "This is among the most common findings in hair consultations, and among the most commonly missed. A patient has been told their blood test is normal, and the haemoglobin genuinely is. But haemoglobin measures iron currently circulating in red cells. Ferritin measures iron stored in tissue — and hair follicles draw on those stores.",
      },
      { type: "heading", text: "Why the distinction matters" },
      {
        type: "paragraph",
        text: "The body protects red blood cell production ahead of almost everything else. When iron intake falls short, stores are depleted first while haemoglobin is maintained. By the time haemoglobin drops, the stores have been empty for a considerable time — and hair, being non-essential from the body's point of view, is among the first things sacrificed.",
      },
      {
        type: "list",
        items: [
          "Ask specifically for serum ferritin, not just a complete blood count",
          "Laboratory reference ranges often start around 12–15 ng/mL, which is a threshold for anaemia rather than an optimum for hair",
          "Menstruating women, vegetarians and endurance athletes are at higher risk",
          "Ferritin rises during infection or inflammation, which can mask a true deficiency",
        ],
      },
      { type: "heading", text: "Correcting it" },
      {
        type: "paragraph",
        text: "Dietary iron helps but rarely refills depleted stores on its own — the quantities involved are larger than most people expect. Where supplementation is needed it should be taken with vitamin C to aid absorption, and away from tea, coffee, calcium and antacids, all of which reduce it substantially.",
      },
      {
        type: "callout",
        text: "Do not start iron supplements on your own on the basis of hair loss. Iron overload is genuinely harmful, and some people carry haemochromatosis without knowing. Test first, then treat.",
      },
    ],
  },
  {
    slug: "postpartum-hair-loss",
    title: "Post-partum hair loss: what nobody warns you about",
    category: "womens-health",
    excerpt:
      "Heavy shedding three to four months after delivery is expected, self-limiting, and one of the most distressing things new mothers encounter.",
    publishedAt: "2026-04-29",
    readingMinutes: 5,
    body: [
      {
        type: "paragraph",
        text: "During pregnancy, elevated oestrogen holds hair in its growing phase for longer than usual. Hair that would ordinarily have shed simply does not. This is why hair often looks thicker during pregnancy — it is not growing faster, it is falling less.",
      },
      {
        type: "paragraph",
        text: "After delivery, oestrogen falls sharply and all of that retained hair enters the shedding phase more or less together. The result arrives around three to four months post-partum and can be dramatic — handfuls in the shower, hair everywhere on the pillow. It is frightening precisely because nobody mentions it beforehand.",
      },
      { type: "heading", text: "What to expect" },
      {
        type: "list",
        items: [
          "Onset typically three to four months after delivery",
          "Peaks around four to six months",
          "Settles on its own by around twelve months in most cases",
          "Density usually returns to near pre-pregnancy levels",
          "Short new hairs around the hairline are regrowth, not breakage",
        ],
      },
      { type: "heading", text: "When it is worth checking" },
      {
        type: "paragraph",
        text: "Post-partum shedding is self-limiting, so treatment is often not needed. It is worth a consultation if shedding continues beyond twelve months, if density has not begun to recover, or if there are other symptoms — persistent exhaustion beyond what a new baby explains, low mood, or unusual weight change. Post-partum thyroiditis is common, frequently missed, and easily tested for. Iron stores are also often depleted by delivery and breastfeeding.",
      },
      {
        type: "callout",
        text: "If you are breastfeeding, say so at the consultation. It affects what can safely be prescribed, including supplements.",
      },
    ],
  },
  {
    slug: "homeopathy-what-to-expect",
    title: "What actually happens in a homeopathic consultation",
    category: "homeopathy",
    excerpt:
      "If you have never been to a homeopath, the first consultation can seem strangely wide-ranging. Here is why it is structured that way.",
    publishedAt: "2026-04-15",
    readingMinutes: 6,
    body: [
      {
        type: "paragraph",
        text: "Patients arriving for a hair consultation are frequently surprised by the questions. Why does it matter how you sleep? Why the questions about temperature, appetite, or what makes symptoms better and worse? The scalp is right there.",
      },
      { type: "heading", text: "Why the history is so long" },
      {
        type: "paragraph",
        text: "Homeopathic prescribing is individualised. Two patients with identical hair fall may receive entirely different prescriptions, because the selection depends on the whole presentation rather than the complaint in isolation. That is why the history covers ground that seems unrelated — it is the material the prescription is actually built from.",
      },
      {
        type: "paragraph",
        text: "There is a second, more practical reason. Hair fall is frequently the visible end of something systemic. The questions about fatigue, cold intolerance, periods and diet are also screening questions. They are how thyroid disease, PCOD and iron deficiency get caught in a consultation that the patient booked about their hair.",
      },
      { type: "heading", text: "What to bring" },
      {
        type: "list",
        items: [
          "Any blood reports from the last year, even if you were told they were normal",
          "A list of all current medicines and supplements, including topical ones",
          "Photographs of your hair from one or two years ago for comparison",
          "For online consultations: clear, well-lit photographs of the scalp, parting and hairline",
        ],
      },
      { type: "heading", text: "What happens afterwards" },
      {
        type: "paragraph",
        text: "You may be asked to get specific tests before a prescription is finalised. Follow-ups are usually at four to six week intervals, and progress is documented photographically because gradual change is genuinely difficult to judge from memory. Prescriptions are adjusted based on how you respond — the first prescription is a starting point, not a fixed course.",
      },
      {
        type: "callout",
        text: "Homeopathic treatment works alongside conventional medicine, not instead of it. Never stop a medication prescribed by another doctor without speaking to that doctor first.",
      },
    ],
  },
  {
    slug: "monsoon-hair-care-kerala",
    title: "Monsoon hair care in Kerala",
    category: "lifestyle",
    excerpt:
      "Four months of humidity, damp hair and rainwater exposure make the monsoon the clinic's busiest season for scalp complaints.",
    publishedAt: "2026-04-01",
    readingMinutes: 4,
    body: [
      {
        type: "paragraph",
        text: "Every year from June the pattern repeats: a rise in dandruff, fungal scalp infections and complaints of increased shedding. It is not coincidence. Sustained humidity, hair that never dries fully, and rainwater carrying pollutants create ideal conditions for scalp problems.",
      },
      { type: "heading", text: "What actually helps" },
      {
        type: "list",
        items: [
          "Dry your scalp properly. Damp hair tied up for hours is the single biggest contributor to monsoon scalp problems.",
          "Wash after rain exposure. Rainwater is not clean water — rinse it out the same day rather than letting it dry in.",
          "Wash more often, not less. Many people reduce washing in humid weather. On an oily scalp this makes flaking worse.",
          "Avoid tying wet hair. It traps moisture against the scalp for hours and encourages fungal growth.",
          "Reduce heavy oiling. What suits a dry February scalp often aggravates a humid July one.",
        ],
      },
      { type: "heading", text: "When to come in" },
      {
        type: "paragraph",
        text: "Persistent itching, a scalp that smells despite washing, well-defined round scaly patches, or flaking that has not responded to a change in routine within three or four weeks all warrant assessment. Fungal scalp infections respond well to treatment but do not clear on their own, and they are frequently mistaken for ordinary dandruff for months.",
      },
    ],
  },
  {
    slug: "children-recurrent-infections",
    title: "When a child seems to catch everything",
    category: "children",
    excerpt:
      "Frequent colds in a young child are usually normal immune development. Knowing where the line is saves a great deal of worry.",
    publishedAt: "2026-03-18",
    readingMinutes: 5,
    body: [
      {
        type: "paragraph",
        text: "A child starting school typically has six to eight respiratory infections a year, sometimes more. To a parent this feels relentless — one illness barely clearing before the next begins. In most cases it is entirely normal, and it is how immune memory is built.",
      },
      { type: "heading", text: "What is within normal range" },
      {
        type: "list",
        items: [
          "Six to eight colds a year in a preschool or early-school child",
          "Each episode resolving within seven to ten days",
          "Normal appetite and energy returning between episodes",
          "Growth and weight gain continuing along their expected curve",
        ],
      },
      { type: "heading", text: "What warrants assessment" },
      {
        type: "list",
        items: [
          "Infections that consistently need antibiotics to resolve",
          "More than two episodes of pneumonia, or recurrent ear infections",
          "Failure to regain weight or energy between episodes",
          "Faltering growth",
          "Persistent fever without an identifiable source",
        ],
      },
      {
        type: "callout",
        text: "Breathing difficulty, unusual drowsiness, persistent vomiting, a rash that does not fade under pressure, or a fever that will not come down all need immediate hospital assessment — not a homeopathic consultation. Trust your judgement if something feels wrong.",
      },
      { type: "heading", text: "How treatment helps" },
      {
        type: "paragraph",
        text: "The realistic aim is reducing how often episodes occur and how severe they are, alongside attention to sleep, nutrition and any allergic tendency. It is not about preventing every infection — a child needs those exposures. Most children naturally settle into fewer infections by around age seven as immune memory accumulates.",
      },
    ],
  },
];

/* ---------------------------------------------------------------- accessors */

function load(): Promise<Post[]> {
  return readDoc<Post[]>("posts", defaults);
}

export async function getPosts(): Promise<Post[]> {
  return [...(await load())].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export async function getFeaturedPosts(): Promise<Post[]> {
  return (await load()).filter((p) => p.featured);
}

export async function getRecentPosts(limit = 3): Promise<Post[]> {
  return (await getPosts()).slice(0, limit);
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  return (await load()).find((p) => p.slug === slug);
}

export async function getPostSlugs(): Promise<string[]> {
  return (await load()).map((p) => p.slug);
}

export async function getPostsByCategory(
  category: PostCategory,
): Promise<Post[]> {
  return (await getPosts()).filter((p) => p.category === category);
}

export async function getRelatedPosts(
  slug: string,
  limit = 3,
): Promise<Post[]> {
  const posts = await load();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return [];
  const sameCategory = posts.filter(
    (p) => p.slug !== slug && p.category === post.category,
  );
  const others = posts.filter(
    (p) => p.slug !== slug && p.category !== post.category,
  );
  return [...sameCategory, ...others].slice(0, limit);
}

/** The raw defaults, used by the admin panel to seed first-time edits. */
export function getPostDefaults(): Post[] {
  return structuredClone(defaults);
}
