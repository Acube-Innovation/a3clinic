/**
 * Condition catalogue.
 *
 * BACKEND SEAM: these are async functions returning local data. Replacing the
 * bodies with CMS/API calls requires no changes at any call site.
 *
 * COPY POLICY: every description below is written to inform, not to promise.
 * No cure claims, no guaranteed timelines, no "permanent solution" language —
 * see the compliance note in README.md.
 */

export type ConditionCategory =
  | "hair"
  | "skin"
  | "chronic"
  | "womens"
  | "child";

export type ResultPair = {
  before: string;
  after: string;
  /** e.g. "Photographs 6 months apart" — never a patient name. */
  label: string;
  note: string;
};

export type Condition = {
  slug: string;
  name: string;
  category: ConditionCategory;
  /** One-line summary used on cards and in meta descriptions. */
  summary: string;
  /** Longer intro shown at the top of the condition page. */
  intro: string;
  symptoms: string[];
  causes: string[];
  /** How the clinic approaches it. */
  treatment: string[];
  /** Deliberately framed as "what to expect", never as guaranteed outcomes. */
  expectedResults: { phase: string; detail: string }[];
  faqs: { question: string; answer: string }[];
  featured?: boolean;
  /** Watermarked before/after documentation, edited on the condition itself. */
  results?: ResultPair[];
  /** Header background image for the condition page (admin upload). */
  heroImage?: string;
  /** Illustration beside the introduction (admin upload). */
  introImage?: string;
};

import { readDoc } from "@/lib/admin/store";

const defaults: Condition[] = [
  {
    slug: "hair-fall",
    name: "Hair Fall",
    category: "hair",
    featured: true,
    summary:
      "Excessive daily shedding, a widening parting or a thinning ponytail — assessed for the underlying cause rather than treated on the scalp alone.",
    intro:
      "Losing 50–100 hairs a day is normal. Persistent shedding beyond that, or hair that no longer grows back at the same density, usually points to something systemic — nutrition, thyroid function, hormones, illness, stress or post-partum change. Homeopathic treatment at the clinic begins by identifying which of these applies to you, because scalp-only treatment rarely holds if the cause sits elsewhere.",
    symptoms: [
      "More than 100 hairs shed daily, noticeable on the pillow, comb or shower floor",
      "A parting that has visibly widened over months",
      "Reduced ponytail thickness",
      "Hair that breaks mid-shaft rather than falling from the root",
      "Scalp becoming visible under direct light",
      "Slow regrowth after a shedding episode",
    ],
    causes: [
      "Iron, vitamin D, vitamin B12 or protein deficiency",
      "Thyroid dysfunction (hypo- or hyperthyroidism)",
      "Hormonal shifts — PCOD, post-partum, perimenopause",
      "Telogen effluvium following fever, surgery, illness or acute stress",
      "Genetic predisposition to androgenetic pattern loss",
      "Chronic scalp inflammation or untreated dandruff",
      "Certain medications and crash dieting",
    ],
    treatment: [
      "A detailed first consultation covering medical history, family history, diet, sleep, stress and menstrual history",
      "Review of existing blood reports; referral for thyroid, ferritin, vitamin D or hormonal testing where indicated",
      "Scalp and hair-shaft examination, in person or via clear photographs for online consultations",
      "An individualised homeopathic prescription — selected for your constitution and cause, not a fixed protocol",
      "Nutritional and hair-care guidance, including what to stop doing",
      "Scheduled follow-ups to reassess and adjust the prescription",
    ],
    expectedResults: [
      {
        phase: "Weeks 1–6",
        detail:
          "The focus is on identifying and addressing the underlying cause. Shedding often continues during this period — this is expected and not a sign of failure.",
      },
      {
        phase: "Months 2–4",
        detail:
          "Many patients report that daily shedding begins to settle. Fine regrowth may appear along the hairline and parting.",
      },
      {
        phase: "Months 4–9",
        detail:
          "Where regrowth occurs, this is when it becomes visible in density. Progress is reviewed at each follow-up with comparison photographs.",
      },
      {
        phase: "Ongoing",
        detail:
          "Response varies considerably between individuals depending on cause, duration and adherence. Some conditions require long-term management rather than a fixed course.",
      },
    ],
    faqs: [
      {
        question: "How soon will I see a difference?",
        answer:
          "This varies genuinely from person to person. Hair grows roughly one centimetre a month, so any treatment needs time before visible change is possible. Most patients are asked to allow three to four months before assessing progress, with follow-ups along the way.",
      },
      {
        question: "Do I need blood tests before starting?",
        answer:
          "Not always, but often. If your history suggests thyroid, iron or hormonal involvement, Dr. Riji will ask for specific tests. If you already have recent reports, bring or upload them — it saves both time and cost.",
      },
      {
        question: "Will the hair fall return if I stop treatment?",
        answer:
          "It depends entirely on the cause. Shedding triggered by a one-off event such as illness or childbirth usually settles and stays settled. Hair fall driven by an ongoing condition — thyroid disease or PCOD, for instance — needs that condition managed continuously.",
      },
      {
        question: "Can homeopathy be taken alongside my other medicines?",
        answer:
          "In most cases yes, but you must disclose everything you are taking, including supplements and topical treatments. Never stop a prescribed conventional medication without speaking to the doctor who prescribed it.",
      },
    ],
  },
  {
    slug: "alopecia",
    name: "Alopecia Areata",
    category: "hair",
    featured: true,
    summary:
      "Sudden, well-defined bald patches on the scalp or beard, usually autoimmune in origin and often responsive to constitutional treatment.",
    intro:
      "Alopecia areata appears as smooth, round patches of hair loss that develop over days or weeks. It is an autoimmune condition — the body's own immune response targets the hair follicle. The follicle is usually not destroyed, which is why regrowth is possible. Because it is systemic rather than local, treatment addresses the immune picture and the person as a whole.",
    symptoms: [
      "One or more smooth, coin-sized bald patches with clearly defined edges",
      "Patches appearing rapidly, sometimes overnight",
      "Short broken hairs at the patch edge, narrower at the base",
      "Occasional tingling, itching or tenderness before a patch appears",
      "Nail pitting or ridging in some cases",
      "Loss in the beard, eyebrows or eyelashes",
    ],
    causes: [
      "Autoimmune activity directed at the hair follicle",
      "Genetic predisposition — a family history of autoimmune conditions is common",
      "Significant emotional or physical stress as a trigger",
      "Associated thyroid disease, vitiligo or other autoimmune conditions",
      "Recent viral illness in some presentations",
    ],
    treatment: [
      "Careful history-taking covering onset, triggers, family autoimmune history and emotional context",
      "Examination of patch borders to assess whether the condition is active or stabilising",
      "Screening for associated thyroid and autoimmune involvement where indicated",
      "Constitutional homeopathic prescribing aimed at the immune picture rather than the patch alone",
      "Support for stress and sleep, which frequently influence the course",
      "Regular photographic review to track patch borders objectively",
    ],
    expectedResults: [
      {
        phase: "Weeks 1–8",
        detail:
          "The first goal is stabilisation — stopping new patches from forming. Existing patches may not change during this window.",
      },
      {
        phase: "Months 2–5",
        detail:
          "Fine, colourless vellus hair often appears within patches first. This is an encouraging sign and typically precedes pigmented regrowth.",
      },
      {
        phase: "Months 5–12",
        detail:
          "Where the response is good, vellus hair thickens and regains pigment. Extensive or long-standing cases progress more slowly.",
      },
      {
        phase: "Important",
        detail:
          "Alopecia areata can relapse even after complete regrowth, and some cases do not respond. This is discussed openly at the first consultation rather than after treatment begins.",
      },
    ],
    faqs: [
      {
        question: "Is alopecia areata permanent?",
        answer:
          "Usually not. The follicles are typically dormant rather than destroyed, which is why regrowth is possible even after months. However, the condition is unpredictable — it can resolve, recur, or in a minority of cases progress. Nobody can reliably predict which course an individual will take.",
      },
      {
        question: "Is it caused by stress?",
        answer:
          "Stress is frequently a trigger rather than the root cause. The underlying mechanism is autoimmune. That said, managing stress genuinely matters, because it influences both the course and the likelihood of relapse.",
      },
      {
        question: "Is it contagious?",
        answer:
          "No. Alopecia areata cannot be passed to anyone else by any form of contact.",
      },
      {
        question: "My child has a patch — is treatment different?",
        answer:
          "The approach is the same in principle but the prescription, dosage and consultation style are adapted for children. Paediatric cases are common and are handled gently, with the child's comfort prioritised.",
      },
    ],
  },
  {
    slug: "dandruff",
    name: "Dandruff & Scalp Conditions",
    category: "hair",
    featured: true,
    summary:
      "Persistent flaking, itching or an oily, inflamed scalp — treated as a skin condition in its own right, not merely a cosmetic nuisance.",
    intro:
      "Dandruff sits on a spectrum from mild dryness to seborrhoeic dermatitis, with redness, greasy yellow scaling and constant itching. It matters beyond appearance: sustained scalp inflammation and scratching damage the follicle and are a common, overlooked contributor to hair fall. Treatment addresses the scalp environment together with the internal tendency that keeps it recurring.",
    symptoms: [
      "White or yellow flakes on the scalp, in the hair and on clothing",
      "Persistent itching, often worse at night",
      "An oily or, conversely, tight and dry scalp",
      "Redness or visible inflammation, particularly around the hairline",
      "Flaking extending to eyebrows, beard or the sides of the nose",
      "Increased hair shedding during washing and combing",
    ],
    causes: [
      "Overgrowth of Malassezia yeast, which is naturally present on all skin",
      "Excess sebum production",
      "Underlying seborrhoeic dermatitis or scalp psoriasis",
      "Harsh shampoos, infrequent washing, or heavy oiling that traps residue",
      "Humidity and heat — a significant factor in Kerala's climate",
      "Stress and dietary patterns high in sugar and refined carbohydrates",
    ],
    treatment: [
      "Direct scalp examination to distinguish simple dandruff from seborrhoeic dermatitis or psoriasis, which are managed differently",
      "Review of current hair-care routine — products, oiling habits and washing frequency",
      "Internal homeopathic prescription targeting the recurring tendency",
      "Practical, specific scalp-care correction rather than generic advice",
      "Dietary guidance where a clear pattern is identified",
      "Assessment of any associated hair fall so both are addressed together",
    ],
    expectedResults: [
      {
        phase: "Weeks 1–3",
        detail:
          "Itching is usually the first symptom to ease. Flaking often continues while the scalp settles.",
      },
      {
        phase: "Weeks 3–8",
        detail:
          "Flaking and redness typically reduce. Correcting the hair-care routine matters as much as the prescription during this phase.",
      },
      {
        phase: "Months 2–4",
        detail:
          "Focus shifts to preventing recurrence. Where hair fall was linked to scalp inflammation, shedding often settles once the scalp is calm.",
      },
      {
        phase: "Ongoing",
        detail:
          "Seborrhoeic dermatitis is a relapsing condition. Flare-ups during humid months or periods of stress are common and manageable.",
      },
    ],
    faqs: [
      {
        question: "Why does my dandruff keep coming back after shampoo works?",
        answer:
          "Medicated shampoos reduce yeast on the scalp surface, which is why they work quickly — and why the problem returns once you stop. They do not change the underlying tendency toward inflammation and sebum production. Treatment aims at that tendency, which is why it takes longer but tends to hold better.",
      },
      {
        question: "Does dandruff actually cause hair fall?",
        answer:
          "Not directly, but the connection is real. Sustained inflammation and repeated scratching weaken the follicle and increase shedding. Treating the scalp often reduces hair fall as a consequence.",
      },
      {
        question: "Should I stop oiling my hair?",
        answer:
          "Not necessarily — but heavy oiling left on an already oily, yeast-affected scalp usually makes things worse. Dr. Riji will advise based on your scalp type rather than applying a blanket rule.",
      },
    ],
  },
  {
    slug: "premature-greying",
    name: "Premature Greying",
    category: "hair",
    featured: true,
    summary:
      "Greying before the age of 25 — investigated for nutritional and thyroid causes, with realistic expectations set from the outset.",
    intro:
      "Hair greys when pigment-producing cells in the follicle reduce their output. When this happens before around 25, it is worth investigating: vitamin B12 deficiency, thyroid dysfunction and anaemia are recognised contributors and are all correctable. Genetics, however, remains the dominant factor, and where greying is genetic no treatment reliably reverses it. That distinction is made clearly at the first consultation.",
    symptoms: [
      "Grey or white strands appearing before the age of 25",
      "Greying concentrated at the temples or crown initially",
      "Grey hair that is coarser or more wiry than pigmented hair",
      "Sometimes accompanied by hair fall or thinning",
      "A family history of early greying in many cases",
    ],
    causes: [
      "Genetic predisposition — by a considerable margin the most common factor",
      "Vitamin B12 deficiency",
      "Thyroid dysfunction",
      "Iron deficiency anaemia",
      "Chronic stress and disturbed sleep",
      "Smoking",
      "Rarely, associated autoimmune conditions such as vitiligo",
    ],
    treatment: [
      "Honest assessment of how much is genetic and how much is potentially correctable",
      "Testing for B12, ferritin and thyroid function where the history warrants it",
      "Correction of identified deficiencies alongside homeopathic prescribing",
      "Constitutional treatment addressing stress, sleep and general vitality",
      "Guidance on avoiding further pigment stress — harsh dyes, chemical treatments, smoking",
    ],
    expectedResults: [
      {
        phase: "First consultation",
        detail:
          "The realistic scope is established. Where greying is clearly genetic and long-standing, this is stated plainly rather than treated as a goal.",
      },
      {
        phase: "Months 1–3",
        detail:
          "Where a deficiency is found and corrected, general hair quality and vitality often improve first.",
      },
      {
        phase: "Months 3–8",
        detail:
          "Slowing the rate of new greying is the realistic aim. Some patients report isolated pigmented regrowth; this is not the expected outcome and is not promised.",
      },
      {
        phase: "Important",
        detail:
          "Reversal of established grey hair is not a reliable outcome of any treatment, homeopathic or otherwise. Any clinic promising it should be treated with caution.",
      },
    ],
    faqs: [
      {
        question: "Can grey hair turn black again?",
        answer:
          "Honestly, usually not. Where greying is caused by a correctable deficiency such as B12, some pigment recovery is occasionally seen. Where it is genetic, it is not reversible. The realistic and worthwhile goal is slowing further greying.",
      },
      {
        question: "Is it worth getting tested?",
        answer:
          "If greying started before 25, yes. B12 deficiency, thyroid disease and anaemia are all common, all easily tested and all worth correcting for reasons well beyond hair colour.",
      },
      {
        question: "Does plucking grey hairs make more grow?",
        answer:
          "No — that is a myth. Only one hair grows from each follicle. Plucking does damage the follicle over time, though, so it is still best avoided.",
      },
    ],
  },
  {
    slug: "hair-thinning",
    name: "Hair Thinning & Pattern Loss",
    category: "hair",
    featured: true,
    summary:
      "Gradual reduction in hair calibre and density, typically at the crown or parting, where early intervention makes the greatest difference.",
    intro:
      "Thinning differs from shedding. Here hairs are not necessarily falling in greater numbers; they are regrowing progressively finer and shorter until they no longer provide coverage. This is the pattern of androgenetic hair loss, and it is progressive. The single most important factor in outcome is how early it is addressed — dormant follicles respond, closed ones do not.",
    symptoms: [
      "A parting that widens gradually over one to two years",
      "Reduced density at the crown, often first noticed in photographs",
      "Hair that feels finer and softer than it used to",
      "Receding at the temples, more common in men",
      "Scalp visible in bright or overhead light",
      "Shedding that may be normal in volume — the change is in regrowth quality",
    ],
    causes: [
      "Androgenetic predisposition — sensitivity of follicles to DHT",
      "PCOD and other conditions raising androgen levels in women",
      "Thyroid dysfunction",
      "Long-standing nutritional deficiency",
      "Age-related follicular miniaturisation",
      "Chronic traction from tight hairstyles",
    ],
    treatment: [
      "Assessment of the pattern and stage, which determines what is realistically achievable",
      "Hormonal and thyroid evaluation, particularly for women, where PCOD is frequently involved",
      "Individualised homeopathic prescription addressing the systemic picture",
      "Nutritional correction and scalp-care guidance",
      "Standardised photographic documentation at each visit, since gradual change is hard to judge by memory",
      "Clear guidance on which hairstyling habits are accelerating the process",
    ],
    expectedResults: [
      {
        phase: "Months 1–3",
        detail:
          "The aim is slowing progression. Existing hair often improves in texture and strength before any density change.",
      },
      {
        phase: "Months 3–6",
        detail:
          "Where follicles remain viable, regrowth of finer hairs may begin in thinned areas.",
      },
      {
        phase: "Months 6–12",
        detail:
          "Meaningful density change, where it occurs, becomes apparent in this window. Comparison photographs are essential — day-to-day observation is unreliable.",
      },
      {
        phase: "Important",
        detail:
          "Pattern hair loss is progressive by nature. Treatment aims to slow it and support what remains viable; areas that have been completely bare for years are unlikely to regrow.",
      },
    ],
    faqs: [
      {
        question: "Is thinning reversible?",
        answer:
          "Partially, and it depends heavily on stage. Miniaturised follicles that still produce fine hair can often be supported. Follicles that have been dormant for several years generally cannot. This is precisely why early consultation matters so much.",
      },
      {
        question: "I am a woman with thinning at the parting — what should I check?",
        answer:
          "Thyroid function, ferritin and, if you have irregular cycles, acne or unwanted facial hair, a PCOD assessment. Female pattern thinning is very often driven by something correctable.",
      },
      {
        question: "Will treatment help if I have been thinning for ten years?",
        answer:
          "It may help slow further loss and improve the condition of remaining hair, but restoring density in long-bare areas is not a realistic expectation. Dr. Riji will tell you what is achievable in your case before you commit to treatment.",
      },
    ],
  },

  /* ---------------- Non-hair conditions ---------------- */

  {
    slug: "skin-disease",
    name: "Skin Conditions",
    category: "skin",
    summary:
      "Eczema, psoriasis, acne, urticaria and fungal infections — treated constitutionally, with attention to what drives recurrence.",
    intro:
      "Skin conditions are frequently the visible surface of something internal. Homeopathic treatment looks at the pattern of your skin complaint — where it appears, what aggravates it, how it behaves in heat or humidity — alongside your general health, and prescribes for the whole picture.",
    symptoms: [
      "Persistent itching, dryness or scaling",
      "Recurrent rashes, hives or wheals",
      "Acne that does not settle with topical treatment",
      "Thickened or discoloured patches of skin",
      "Fungal infection that recurs after each course of treatment",
      "Flares linked to season, stress or particular foods",
    ],
    causes: [
      "Atopic tendency, often with associated asthma or allergic rhinitis",
      "Autoimmune activity, as in psoriasis",
      "Hormonal factors, particularly with acne",
      "Contact and food allergens",
      "Humidity, sweat and heat — significant in a coastal climate",
      "Gut and digestive disturbance",
    ],
    treatment: [
      "Detailed history of onset, pattern, triggers and previous treatment",
      "Examination or clear photographs for online consultations",
      "Constitutional prescribing rather than suppression of the eruption alone",
      "Identification of dietary and environmental triggers",
      "Realistic guidance on chronic relapsing conditions such as psoriasis",
    ],
    expectedResults: [
      {
        phase: "Weeks 1–4",
        detail: "Itching and discomfort are usually the first symptoms to ease.",
      },
      {
        phase: "Months 1–3",
        detail:
          "Visible improvement in the eruption itself, with reducing frequency of flares.",
      },
      {
        phase: "Months 3–9",
        detail:
          "Focus moves to reducing recurrence. Chronic conditions are managed rather than cured.",
      },
    ],
    faqs: [
      {
        question: "Will my skin get worse before it gets better?",
        answer:
          "Occasionally a temporary increase in symptoms is seen early in treatment. If this happens, report it at your follow-up rather than stopping treatment on your own — it changes how the prescription is adjusted.",
      },
      {
        question: "Can I continue my steroid cream?",
        answer:
          "Do not stop a prescribed topical steroid abruptly, as this can cause a rebound flare. Discuss it with Dr. Riji, who will advise on a gradual approach in coordination with your dermatologist where appropriate.",
      },
    ],
  },
  {
    slug: "thyroid",
    name: "Thyroid Disorders",
    category: "chronic",
    summary:
      "Hypothyroidism and hyperthyroidism, managed alongside — never instead of — your endocrinologist's monitoring.",
    intro:
      "Thyroid dysfunction affects weight, energy, mood, menstrual cycles and, very commonly, hair. Homeopathic treatment can support general wellbeing and the associated symptoms. It does not replace thyroid hormone replacement where that has been prescribed, and no one at this clinic will advise you to stop it.",
    symptoms: [
      "Fatigue that rest does not resolve",
      "Unexplained weight change",
      "Hair fall, particularly diffuse thinning and loss of the outer eyebrow",
      "Cold or heat intolerance",
      "Irregular menstrual cycles",
      "Low mood, anxiety or difficulty concentrating",
      "Dry skin, constipation or palpitations",
    ],
    causes: [
      "Hashimoto's thyroiditis and other autoimmune thyroid disease",
      "Iodine imbalance",
      "Post-partum thyroiditis",
      "Genetic predisposition",
      "Certain medications",
    ],
    treatment: [
      "Review of current TSH, T3 and T4 reports and existing prescriptions",
      "Homeopathic treatment for associated symptoms and general vitality",
      "Specific attention to thyroid-related hair fall, which is very common",
      "Coordination with — not replacement of — your treating physician",
      "Periodic re-testing to monitor objectively",
    ],
    expectedResults: [
      {
        phase: "Months 1–3",
        detail:
          "Symptomatic relief is the initial focus — energy, sleep, digestion and mood.",
      },
      {
        phase: "Months 3–6",
        detail:
          "Associated hair fall often begins to settle as general health stabilises.",
      },
      {
        phase: "Ongoing",
        detail:
          "Thyroid disease usually requires long-term management. Any change to hormone replacement is a decision for your prescribing physician, based on blood results.",
      },
    ],
    faqs: [
      {
        question: "Can I stop my thyroxine tablets?",
        answer:
          "No — not on the basis of homeopathic treatment. Thyroid hormone replacement is prescribed on the basis of blood results and only your prescribing physician should change it. Stopping it abruptly can be genuinely dangerous.",
      },
      {
        question: "Will my thyroid-related hair fall recover?",
        answer:
          "Hair fall from thyroid dysfunction commonly improves once thyroid levels are stable, though it typically lags several months behind normalised blood results.",
      },
    ],
  },
  {
    slug: "pcod",
    name: "PCOD & Women's Health",
    category: "womens",
    summary:
      "Irregular cycles, hormonal acne, unwanted hair growth and scalp thinning — addressed together rather than symptom by symptom.",
    intro:
      "PCOD presents differently in different women, and the hair-related effects — thinning at the parting alongside unwanted growth on the face — are among the most distressing. Treatment addresses the hormonal picture as a whole, together with the lifestyle factors that materially influence it.",
    symptoms: [
      "Irregular, delayed or absent menstrual periods",
      "Hair thinning at the crown and parting",
      "Unwanted facial or body hair",
      "Persistent acne along the jawline and chin",
      "Weight gain that is difficult to shift",
      "Difficulty conceiving",
      "Mood changes and fatigue",
    ],
    causes: [
      "Insulin resistance",
      "Elevated androgen levels",
      "Genetic predisposition",
      "Weight and lifestyle factors",
      "Chronic stress affecting hormonal rhythm",
    ],
    treatment: [
      "Detailed menstrual, weight and family history",
      "Review of ultrasound and hormonal reports where available",
      "Constitutional homeopathic prescribing for the hormonal picture",
      "Specific attention to scalp thinning and hirsutism",
      "Practical dietary and exercise guidance targeting insulin resistance",
      "Follow-up tracking of cycle regularity as the objective marker",
    ],
    expectedResults: [
      {
        phase: "Months 1–3",
        detail:
          "Early focus on cycle regularity, energy and reducing acne severity.",
      },
      {
        phase: "Months 3–6",
        detail:
          "Cycles frequently become more predictable. Scalp thinning typically responds later than other symptoms.",
      },
      {
        phase: "Months 6–12",
        detail:
          "Sustained improvement depends substantially on lifestyle change alongside medication. PCOD is managed long term rather than cured.",
      },
    ],
    faqs: [
      {
        question: "Will treatment help me conceive?",
        answer:
          "Restoring cycle regularity can support fertility, but conception depends on many factors. If you are actively trying to conceive, tell Dr. Riji at the first consultation so treatment is planned appropriately and coordinated with your gynaecologist.",
      },
      {
        question: "Why is my hair thinning on my scalp but growing on my face?",
        answer:
          "Both are effects of elevated androgens. Scalp follicles are sensitive to them and miniaturise, while facial follicles are stimulated by them. Addressing the hormonal picture is what improves both.",
      },
    ],
  },
  {
    slug: "allergy",
    name: "Allergies & Asthma",
    category: "chronic",
    summary:
      "Allergic rhinitis, asthma and urticaria — treated with attention to the underlying sensitivity, not just the acute episode.",
    intro:
      "Allergic conditions tend to run together and to run in families. Homeopathic treatment aims to reduce the frequency and severity of episodes over time. Rescue medication for asthma remains essential and must always be kept available.",
    symptoms: [
      "Recurrent sneezing, nasal blockage and watery eyes",
      "Wheezing, breathlessness or night-time cough",
      "Hives appearing with heat, cold, food or stress",
      "Seasonal or dust-triggered flares",
      "Associated eczema, particularly in children",
    ],
    causes: [
      "Atopic constitution, usually with family history",
      "Dust mite, pollen, mould and pet dander exposure",
      "Food sensitivities",
      "Humidity and monsoon-season triggers",
      "Respiratory infections precipitating flares",
    ],
    treatment: [
      "Identification of individual trigger patterns",
      "Constitutional prescribing to reduce underlying sensitivity",
      "Practical guidance on reducing household allergen exposure",
      "Clear instruction that inhalers and rescue medication continue as prescribed",
      "Seasonal follow-ups ahead of known trigger periods",
    ],
    expectedResults: [
      {
        phase: "Months 1–3",
        detail: "Reduction in the intensity of acute episodes is the first aim.",
      },
      {
        phase: "Months 3–9",
        detail:
          "Many patients report fewer episodes and reduced reliance on rescue medication.",
      },
      {
        phase: "Ongoing",
        detail:
          "Allergic tendency is constitutional. Treatment aims at long-term reduction in sensitivity rather than elimination.",
      },
    ],
    faqs: [
      {
        question: "Can I stop using my asthma inhaler?",
        answer:
          "No. Never stop or reduce asthma medication without the explicit direction of your treating physician. Asthma can become life-threatening quickly, and a rescue inhaler must always remain accessible.",
      },
    ],
  },
  {
    slug: "child-care",
    name: "Child Care",
    category: "child",
    summary:
      "Recurrent infections, allergies, eczema, appetite and behavioural concerns — treated gently and age-appropriately.",
    intro:
      "Children respond well to homeopathic treatment and generally accept the medicines without difficulty. Consultations are unhurried and paced for the child, with parents fully involved in the plan.",
    symptoms: [
      "Frequently recurring colds, coughs and tonsillitis",
      "Childhood eczema and allergic tendency",
      "Poor appetite and slow weight gain",
      "Disturbed sleep or night terrors",
      "Behavioural and concentration concerns",
      "Recurrent stomach upsets",
    ],
    causes: [
      "Developing immune system with frequent early exposure",
      "Inherited atopic tendency",
      "Nutritional gaps",
      "School environment and increased infection exposure",
      "Emotional and family stress",
    ],
    treatment: [
      "Consultation paced for the child, including developmental and birth history",
      "Age-appropriate dosage in a palatable form",
      "Nutritional and routine guidance for parents",
      "Clear instruction on the warning signs that require urgent conventional care",
      "Growth and frequency-of-illness tracking across follow-ups",
    ],
    expectedResults: [
      {
        phase: "Months 1–3",
        detail:
          "Reduced severity and duration of individual episodes is usually seen first.",
      },
      {
        phase: "Months 3–6",
        detail:
          "Many parents report a fall in the frequency of infections and improved appetite.",
      },
      {
        phase: "Ongoing",
        detail:
          "Immunity strengthens naturally with age; treatment supports this rather than replacing it.",
      },
    ],
    faqs: [
      {
        question: "Are homeopathic medicines safe for young children?",
        answer:
          "They are prepared in highly dilute form and are generally well tolerated. That said, any medicine for a child should be given only as prescribed, and never shared between children.",
      },
      {
        question: "When should I take my child to a hospital instead?",
        answer:
          "High fever that will not come down, breathing difficulty, persistent vomiting, unusual drowsiness, a rash that does not fade under pressure, or any situation that worries you — go directly to emergency care. Homeopathic treatment is not a substitute for emergency medicine.",
      },
    ],
  },
  {
    slug: "migraine",
    name: "Migraine & Lifestyle Disorders",
    category: "chronic",
    summary:
      "Recurrent headaches, arthritis and stress-related complaints, addressed through trigger patterns and constitutional treatment.",
    intro:
      "Recurrent migraine, joint pain and lifestyle-related complaints share a common thread: they respond best when patterns are identified rather than episodes merely suppressed. Treatment begins with understanding when and why your symptoms occur.",
    symptoms: [
      "Recurrent one-sided throbbing headache",
      "Nausea, and sensitivity to light or sound",
      "Visual aura preceding the headache",
      "Joint pain and morning stiffness",
      "Persistent fatigue and disturbed sleep",
      "Symptoms clearly linked to stress, skipped meals or menstrual cycle",
    ],
    causes: [
      "Genetic predisposition to migraine",
      "Hormonal fluctuation",
      "Irregular meals, sleep debt and dehydration",
      "Stress and prolonged screen exposure",
      "Specific dietary triggers",
      "Sedentary routine and postural strain",
    ],
    treatment: [
      "Trigger diary review to establish an objective pattern",
      "Constitutional prescribing for frequency and intensity",
      "Practical routine correction — meals, sleep, hydration, screen breaks",
      "Referral for imaging or specialist assessment where red-flag features are present",
      "Follow-ups tracking episode frequency rather than relying on recall",
    ],
    expectedResults: [
      {
        phase: "Months 1–2",
        detail: "Reduction in episode intensity is generally the first change.",
      },
      {
        phase: "Months 2–6",
        detail:
          "Many patients report fewer episodes per month and shorter duration.",
      },
      {
        phase: "Ongoing",
        detail:
          "Long-term control depends on maintaining routine changes alongside treatment.",
      },
    ],
    faqs: [
      {
        question: "When is a headache an emergency?",
        answer:
          "A sudden, severe headache unlike any you have had before, one with fever and neck stiffness, or one accompanied by weakness, confusion or visual loss needs immediate hospital assessment. Do not wait for a homeopathic consultation in those circumstances.",
      },
    ],
  },
];

/* ---------------------------------------------------------------- accessors */

function load(): Promise<Condition[]> {
  return readDoc<Condition[]>("conditions", defaults);
}

export async function getConditions(): Promise<Condition[]> {
  return load();
}

export async function getFeaturedHairConditions(): Promise<Condition[]> {
  return (await load()).filter((c) => c.category === "hair" && c.featured);
}

export async function getConditionsByCategory(
  category: ConditionCategory,
): Promise<Condition[]> {
  return (await load()).filter((c) => c.category === category);
}

export async function getConditionBySlug(
  slug: string,
): Promise<Condition | undefined> {
  return (await load()).find((c) => c.slug === slug);
}

export async function getConditionSlugs(): Promise<string[]> {
  return (await load()).map((c) => c.slug);
}

/** The raw defaults, used by the admin panel to seed first-time edits. */
export function getConditionDefaults(): Condition[] {
  return structuredClone(defaults);
}

/** Complete pairs from a condition (both photos present). */
export function pairsOf(condition: Condition): ResultPair[] {
  return (condition.results ?? []).filter((r) => Boolean(r.before) && Boolean(r.after));
}

/**
 * Every complete pair across all conditions, for the site-wide
 * "Documenting progress" section. Falls back to the condition name when the
 * admin left the case label empty.
 */
export async function getAllResultPairs(): Promise<ResultPair[]> {
  const conditions = await load();
  return conditions.flatMap((condition) =>
    pairsOf(condition).map((pair) => ({
      ...pair,
      label: pair.label || condition.name,
    })),
  );
}

export const categoryLabels: Record<ConditionCategory, string> = {
  hair: "Hair & Scalp",
  skin: "Skin",
  chronic: "Chronic & Lifestyle",
  womens: "Women's Health",
  child: "Child Care",
};
