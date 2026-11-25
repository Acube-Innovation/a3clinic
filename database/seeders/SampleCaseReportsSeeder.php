<?php

namespace Database\Seeders;

use App\Support\ContentStore;
use Illuminate\Database\Seeder;
use RuntimeException;

/**
 * ILLUSTRATIVE sample case reports with placeholder photos, for building and
 * reviewing the /results pages before real consented cases are supplied.
 *
 *   php artisan db:seed --class=SampleCaseReportsSeeder
 *
 * Every case is flagged `sample`: the site labels it "Illustrative example",
 * keeps it out of search engines, and hides it entirely in production
 * (config app.show_sample_cases). This seeder refuses to run in production
 * and is deliberately NOT called from DatabaseSeeder (deploy runs db:seed).
 */
class SampleCaseReportsSeeder extends Seeder
{
    public function run(ContentStore $store): void
    {
        if (app()->isProduction()) {
            throw new RuntimeException('Sample case reports are for local review only.');
        }

        // Keep any real cases; replace earlier samples. Skip samples whose
        // condition this site doesn't have.
        $real = array_values(array_filter($store->read('cases'), fn ($c) => empty($c['sample'])));
        $slugs = array_column($store->read('conditions'), 'slug');
        $samples = array_values(array_filter($this->samples(), fn ($c) => in_array($c['conditionSlug'], $slugs, true)));
        $store->write('cases', [...$samples, ...$real]);
    }

    private static function photos(string $stage, array $views = ['front', 'crown']): array
    {
        $names = ['front' => 'Front', 'crown' => 'Crown', 'close-up' => 'Close-up'];

        return array_map(fn ($v) => ['view' => $names[$v], 'image' => "/images/cases/placeholder-{$stage}-{$v}.jpg"], $views);
    }

    private static function case(array $c): array
    {
        return [
            'remedies' => '', 'consentOnFile' => false, 'consentDate' => '', 'consentDocument' => '',
            'published' => true, 'featured' => false, 'sample' => true, 'noindex' => true,
            ...$c,
            'slug' => strtolower($c['code']),
        ];
    }

    private function samples(): array
    {
        return [
            self::case([
                'code' => 'SAMPLE-HF-01',
                'title' => 'Diffuse hair fall after a stressful year',
                'conditionSlug' => 'hair-fall',
                'sex' => 'female', 'ageBand' => '28–32', 'complaintDuration' => '14 months', 'followUp' => '9 months',
                'featured' => true,
                'summary' => 'Heavy daily shedding with a widening parting, assessed with trichoscopy and blood work, and documented at four visits over nine months.',
                'presentation' => 'Noticeable hair on the pillow and in the shower every day, a widening centre parting and a thinner ponytail. No patches of complete loss.',
                'history' => 'Shedding began a few months after a period of significant stress and disturbed sleep. Irregular meals. No family history of early baldness. No thyroid diagnosis at presentation.',
                'assessment' => 'Positive pull test over the crown and sides. Trichoscopy showed many short regrowing hairs and no miniaturisation pattern. Haemoglobin and ferritin were low; thyroid function normal.',
                'approach' => [
                    'Detailed constitutional case-taking: sleep, stress, diet, menstrual history.',
                    'Individualised homeopathic prescription, reviewed at every visit.',
                    'Diet correction for iron intake, coordinated with the patient\'s GP for supplementation.',
                    'Gentle scalp-care routine; heat styling and tight hairstyles paused.',
                    'Standardised photographs at every follow-up.',
                ],
                'outcome' => 'Shedding reduced noticeably by the third month. By month nine the parting appeared narrower in standardised photographs and short regrowing hairs were visible along it. Ferritin had returned to the normal range. Occasional seasonal shedding continues and is being monitored.',
                'doctorNote' => 'Telogen shedding usually settles once its trigger is addressed. Correcting iron and sleep mattered as much as the prescription here.',
                'stages' => [
                    ['label' => 'Baseline', 'timepoint' => 'First consultation', 'note' => 'Widened parting, positive pull test, many short hairs on trichoscopy.', 'photos' => self::photos('baseline')],
                    ['label' => 'Review 1', 'timepoint' => 'Month 3', 'note' => 'Daily shedding roughly halved by patient report. Pull test weakly positive.', 'photos' => self::photos('month-3')],
                    ['label' => 'Review 2', 'timepoint' => 'Month 6', 'note' => 'Pull test negative. Regrowing hairs visible along the parting.', 'photos' => self::photos('month-6')],
                    ['label' => 'Review 3', 'timepoint' => 'Month 9', 'note' => 'Parting narrower in standardised photos. Maintenance plan agreed.', 'photos' => self::photos('month-9')],
                ],
            ]),
            self::case([
                'code' => 'SAMPLE-AA-02',
                'title' => 'Single patch of alopecia areata at the back of the scalp',
                'conditionSlug' => 'alopecia',
                'sex' => 'male', 'ageBand' => '22–26', 'complaintDuration' => '4 months', 'followUp' => '6 months',
                'featured' => true,
                'summary' => 'A coin-sized bald patch documented from first consultation to regrowth over six months.',
                'presentation' => 'A smooth, round bald patch about 3 cm across, noticed by a barber. No itching or scaling.',
                'history' => 'Exams and irregular sleep in the months before. A previous small patch regrew on its own two years earlier.',
                'assessment' => 'Single well-defined patch with exclamation-mark hairs at the margin on trichoscopy. No nail changes. Thyroid screen normal.',
                'approach' => [
                    'Constitutional case-taking and individualised homeopathic prescription.',
                    'Explained the natural course of patchy alopecia areata, including relapse risk.',
                    'Monthly reviews with photographs of the patch from a fixed distance.',
                ],
                'outcome' => 'Fine vellus hair appeared within the patch by month three and terminal, pigmented regrowth covered most of it by month six. Alopecia areata can recur; the patient knows to return early if a new patch appears.',
                'doctorNote' => 'Single patches often have a good outlook, and some regrow without treatment, which is why we document carefully rather than claim credit.',
                'stages' => [
                    ['label' => 'Baseline', 'timepoint' => 'First consultation', 'note' => 'Smooth patch, exclamation-mark hairs at the margin.', 'photos' => self::photos('baseline', ['close-up'])],
                    ['label' => 'Review 1', 'timepoint' => 'Month 3', 'note' => 'Fine, light vellus hairs across the patch.', 'photos' => self::photos('month-3', ['close-up'])],
                    ['label' => 'Review 2', 'timepoint' => 'Month 6', 'note' => 'Pigmented terminal hair covering most of the patch.', 'photos' => self::photos('month-6', ['close-up'])],
                ],
            ]),
            self::case([
                'code' => 'SAMPLE-DS-03',
                'title' => 'Persistent dandruff with an itchy, flaking scalp',
                'conditionSlug' => 'dandruff',
                'sex' => 'male', 'ageBand' => '35–40', 'complaintDuration' => '3 years', 'followUp' => '4 months',
                'summary' => 'Long-standing flaking that returned after every anti-dandruff shampoo, documented over four months.',
                'presentation' => 'White and yellowish flakes on shoulders, itching worse in winter, redness along the hairline.',
                'history' => 'Many anti-dandruff shampoos with short-lived relief. Oily skin on the face. Long office hours.',
                'assessment' => 'Greasy scale over the vertex and behind the ears, mild redness at the frontal hairline, consistent with seborrhoeic dermatitis of the scalp.',
                'approach' => [
                    'Individualised homeopathic prescription.',
                    'Simplified hair-wash routine, twice weekly, with a mild shampoo.',
                    'Diet and sleep advice; review every four to six weeks.',
                ],
                'outcome' => 'Itching settled within the first month. Visible flaking was much reduced by month four, with a mild flare during one cold spell. Seborrhoeic dermatitis tends to relapse, so the patient continues the routine.',
                'doctorNote' => '',
                'stages' => [
                    ['label' => 'Baseline', 'timepoint' => 'First consultation', 'note' => 'Greasy scale over the vertex.', 'photos' => self::photos('baseline', ['crown'])],
                    ['label' => 'Review 1', 'timepoint' => 'Month 2', 'note' => 'Less scale, no redness at the hairline.', 'photos' => self::photos('month-3', ['crown'])],
                    ['label' => 'Review 2', 'timepoint' => 'Month 4', 'note' => 'Minimal visible scale.', 'photos' => self::photos('month-6', ['crown'])],
                ],
            ]),
            self::case([
                'code' => 'SAMPLE-PS-04',
                'title' => 'Plaque psoriasis on the elbows and knees',
                'conditionSlug' => 'psoriasis',
                'sex' => 'male', 'ageBand' => '45–50', 'complaintDuration' => '8 years', 'followUp' => '12 months',
                'summary' => 'Chronic plaques managed alongside the patient\'s existing care, with a year of standardised photographs.',
                'presentation' => 'Thick, scaly plaques on both elbows and knees, worse in winter, occasionally cracking.',
                'history' => 'Diagnosed by a dermatologist eight years earlier. Uses emollients. Flares with stress.',
                'assessment' => 'Well-demarcated plaques with silvery scale; nails and joints not involved.',
                'approach' => [
                    'Individualised homeopathic prescription, alongside the dermatologist\'s plan (nothing stopped).',
                    'Daily emollient routine and lukewarm bathing.',
                    'Stress and sleep discussed at each visit.',
                ],
                'outcome' => 'Plaques became thinner and less scaly over the year, with one winter flare that was milder than in previous years by the patient\'s account. Psoriasis is a long-term condition; the aim is control, not a cure.',
                'doctorNote' => 'With psoriasis we talk about control and fewer, milder flares, never a cure.',
                'stages' => [
                    ['label' => 'Baseline', 'timepoint' => 'First consultation', 'note' => 'Thick plaques with heavy scale.', 'photos' => self::photos('baseline', ['close-up'])],
                    ['label' => 'Review 1', 'timepoint' => 'Month 4', 'note' => 'Scale reduced; plaques still raised.', 'photos' => self::photos('month-3', ['close-up'])],
                    ['label' => 'Review 2', 'timepoint' => 'Month 8', 'note' => 'Plaques flatter; mild winter flare.', 'photos' => self::photos('month-6', ['close-up'])],
                    ['label' => 'Review 3', 'timepoint' => 'Month 12', 'note' => 'Thin residual patches.', 'photos' => self::photos('month-9', ['close-up'])],
                ],
            ]),
            self::case([
                'code' => 'SAMPLE-FP-05',
                'title' => 'Female pattern thinning over the crown',
                'conditionSlug' => 'female-pattern-hair-loss',
                'sex' => 'female', 'ageBand' => '40–45', 'complaintDuration' => '5 years', 'followUp' => '12 months',
                'featured' => true,
                'summary' => 'Gradual widening over the crown, followed with trichoscopy and crown photographs for a year.',
                'presentation' => 'Scalp increasingly visible over the crown under bright light; no increase in daily shedding.',
                'history' => 'Mother had similar thinning. Periods becoming irregular. No major illness.',
                'assessment' => 'Widened central parting with preserved frontal hairline. Trichoscopy showed variable hair shaft thickness (miniaturisation). Iron and thyroid normal.',
                'approach' => [
                    'Individualised homeopathic prescription with hormonal history in focus.',
                    'Realistic expectations set: the goal is to slow progression and improve density where possible.',
                    'Crown photographed from a fixed height at every review.',
                ],
                'outcome' => 'Density over the crown was stable to slightly improved in standardised photographs at twelve months, with more thick hairs on trichoscopy. Pattern hair loss is progressive; ongoing review is planned.',
                'doctorNote' => '',
                'stages' => [
                    ['label' => 'Baseline', 'timepoint' => 'First consultation', 'note' => 'Christmas-tree widening over the crown.', 'photos' => self::photos('baseline', ['crown'])],
                    ['label' => 'Review 1', 'timepoint' => 'Month 6', 'note' => 'Stable; fewer fine hairs on trichoscopy.', 'photos' => self::photos('month-6', ['crown'])],
                    ['label' => 'Review 2', 'timepoint' => 'Month 12', 'note' => 'Crown density slightly improved.', 'photos' => self::photos('month-9', ['crown'])],
                ],
            ]),
            self::case([
                'code' => 'SAMPLE-IE-06',
                'title' => 'Infantile eczema on the cheeks and arm creases',
                'conditionSlug' => 'infantile-eczema',
                'sex' => 'male', 'ageBand' => 'Under 2', 'complaintDuration' => '5 months', 'followUp' => '5 months',
                'summary' => 'Dry, itchy patches in a toddler, documented with the parents\' consent over five months.',
                'presentation' => 'Red, rough patches on both cheeks and in the elbow creases, scratching at night.',
                'history' => 'Family history of asthma and allergic rhinitis. Patches started after weaning.',
                'assessment' => 'Typical distribution of atopic eczema; no signs of infection.',
                'approach' => [
                    'Individualised homeopathic prescription suited to children.',
                    'Bathing and emollient routine taught to the parents.',
                    'Cotton clothing and trimmed nails; triggers diary kept by parents.',
                ],
                'outcome' => 'Night-time scratching settled and the cheek patches cleared over five months; the elbow creases still flare occasionally in hot weather. Many children outgrow eczema, but it can return.',
                'doctorNote' => 'The parents\' daily routine did a great deal of the work here.',
                'stages' => [
                    ['label' => 'Baseline', 'timepoint' => 'First consultation', 'note' => 'Red, rough cheek patches.', 'photos' => self::photos('baseline', ['close-up'])],
                    ['label' => 'Review 1', 'timepoint' => 'Month 2', 'note' => 'Less redness; still dry.', 'photos' => self::photos('month-3', ['close-up'])],
                    ['label' => 'Review 2', 'timepoint' => 'Month 5', 'note' => 'Cheeks clear; creases mild.', 'photos' => self::photos('month-9', ['close-up'])],
                ],
            ]),
        ];
    }
}
