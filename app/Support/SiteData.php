<?php

namespace App\Support;

/**
 * The public site's data layer: a port of the async getters in the Next.js
 * app's src/data/*.ts (getConditions, getRelatedProducts, getRecentPosts…).
 * Each section is read once per request through ContentStore.
 */
class SiteData
{
    /** Shop filter order (src/data/product-types.ts categoryOrder). */
    public const PRODUCT_CATEGORY_ORDER = [
        'hair-oil', 'hair-serum', 'shampoo', 'conditioner', 'hair-kit', 'skin-care', 'medicine', 'supplements',
    ];

    private array $cache = [];

    public function __construct(private ContentStore $store) {}

    private function section(string $name): mixed
    {
        return $this->cache[$name] ??= $this->store->read($name);
    }

    // ------------------------------------------------------------------ conditions

    public function conditions(): array
    {
        return $this->section('conditions');
    }

    /** Listing-card fields only (matches ConditionCard in resources/js/data/conditions.ts). */
    public function conditionCards(?array $conditions = null): array
    {
        $keys = array_flip(['slug', 'name', 'category', 'summary', 'featured', 'heroImage', 'introImage']);

        return array_map(fn ($c) => array_intersect_key($c, $keys), $conditions ?? $this->conditions());
    }

    public function featuredHairConditions(): array
    {
        return array_values(array_filter($this->conditions(), fn ($c) => $c['category'] === 'hair' && ! empty($c['featured'])));
    }

    public function conditionBySlug(string $slug): ?array
    {
        return collect($this->conditions())->firstWhere('slug', $slug);
    }

    /**
     * Before/after pairs for the home and hair-treatment progress sections:
     * featured case reports (else the first three), each linking to its case.
     */
    public function allResultPairs(): array
    {
        $cases = $this->cases();
        $featured = array_values(array_filter($cases, fn ($c) => ! empty($c['featured'])));

        return collect($featured ?: array_slice($cases, 0, 3))
            ->map(function ($c) {
                $cover = CaseReports::coverPair($c);

                return $cover ? [
                    'before' => $cover['before'],
                    'after' => $cover['after'],
                    'label' => trim("{$c['conditionName']} · {$c['code']}", ' ·'),
                    'note' => $c['summary'],
                    'href' => "/results/{$c['slug']}",
                    'sample' => ! empty($c['sample']),
                ] : null;
            })->filter()->values()->all();
    }

    // ---------------------------------------------------------------- case reports

    /**
     * Published cases in stored order, public fields only, each with its
     * condition's name and category. Sample cases only where allowed.
     */
    public function cases(): array
    {
        $showSamples = (bool) config('app.show_sample_cases');

        return collect($this->section('cases'))
            ->filter(fn ($c) => ! empty($c['published']) && ($showSamples || empty($c['sample'])))
            ->map(fn ($c) => $this->publicCase($c))->values()->all();
    }

    /** Any case, published or not, for a signed-in admin's preview. */
    public function caseForPreview(string $slug): ?array
    {
        $case = collect($this->section('cases'))->firstWhere('slug', $slug);

        return $case ? $this->publicCase($case) : null;
    }

    private function publicCase(array $c): array
    {
        $condition = collect($this->conditions())->firstWhere('slug', $c['conditionSlug'] ?? '');

        return [
            ...CaseReports::public($c),
            'conditionName' => $condition['name'] ?? '',
            'category' => $condition['category'] ?? '',
        ];
    }

    /** Listing-card fields (CaseCard in resources/js/data/cases.ts). */
    public function caseCards(?array $cases = null): array
    {
        $keys = array_flip(['slug', 'code', 'title', 'summary', 'conditionSlug', 'conditionName', 'category',
            'sex', 'ageBand', 'followUp', 'featured', 'sample']);

        return array_map(fn ($c) => [
            ...array_intersect_key($c, $keys),
            'cover' => CaseReports::coverPair($c),
            'stageCount' => count($c['stages'] ?? []),
        ], $cases ?? $this->cases());
    }

    public function caseBySlug(string $slug): ?array
    {
        return collect($this->cases())->firstWhere('slug', $slug);
    }

    public function casesForCondition(string $conditionSlug): array
    {
        return array_values(array_filter($this->cases(), fn ($c) => $c['conditionSlug'] === $conditionSlug));
    }

    /** Same condition first, then same category, excluding the case itself. */
    public function relatedCases(array $case, int $limit = 3): array
    {
        // Real cases relate to real cases, samples to samples.
        $others = collect($this->cases())->where('slug', '!=', $case['slug'])
            ->filter(fn ($c) => ! empty($c['sample']) === ! empty($case['sample']));

        return $others->where('conditionSlug', $case['conditionSlug'])
            ->concat($others->where('conditionSlug', '!=', $case['conditionSlug'])->where('category', $case['category']))
            ->take($limit)->values()->all();
    }

    /** Header "Treatments" menu: the programme, every featured condition, the index. */
    public function treatmentsMenu(callable $t): array
    {
        return [
            ['label' => $t('hairTreatment'), 'href' => '/hair-treatment'],
            ...collect($this->conditions())->filter(fn ($c) => ! empty($c['featured']))
                ->map(fn ($c) => ['label' => $c['name'], 'href' => "/conditions/{$c['slug']}"])->values(),
            ['label' => $t('allConditions'), 'href' => '/conditions'],
        ];
    }

    // -------------------------------------------------------------------- products

    public function products(): array
    {
        return $this->section('products');
    }

    public function featuredProducts(): array
    {
        return array_values(array_filter($this->products(), fn ($p) => ! empty($p['featured'])));
    }

    public function productBySlug(string $slug): ?array
    {
        return collect($this->products())->firstWhere('slug', $slug);
    }

    public function relatedProducts(string $slug): array
    {
        $product = $this->productBySlug($slug);
        if (! $product) {
            return [];
        }
        $bySlug = collect($this->products())->keyBy('slug');

        return collect($product['related'] ?? [])->map(fn ($s) => $bySlug->get($s))->filter()->values()->all();
    }

    /** Categories that actually have products, in shop order. */
    public function activeCategories(): array
    {
        $present = array_column($this->products(), 'category');

        return array_values(array_filter(self::PRODUCT_CATEGORY_ORDER, fn ($c) => in_array($c, $present, true)));
    }

    // ----------------------------------------------------------------------- posts

    /** Newest first. */
    public function posts(): array
    {
        return collect($this->section('posts'))
            ->sortByDesc('publishedAt', SORT_STRING)->values()->all();
    }

    public function recentPosts(int $limit = 3): array
    {
        return array_slice($this->posts(), 0, $limit);
    }

    public function postBySlug(string $slug): ?array
    {
        return collect($this->section('posts'))->firstWhere('slug', $slug);
    }

    /** Same-category posts first, then the rest (stored order), excluding the post itself. */
    public function relatedPosts(string $slug, int $limit = 3): array
    {
        $posts = collect($this->section('posts'));
        $post = $posts->firstWhere('slug', $slug);
        if (! $post) {
            return [];
        }
        $others = $posts->where('slug', '!=', $slug);

        return $others->where('category', $post['category'])
            ->concat($others->where('category', '!=', $post['category']))
            ->take($limit)->values()->all();
    }

    // ----------------------------------------------------------- singletons & lists

    /** Stored clinic settings merged over the defaults (a missing field never disappears). */
    public function clinic(): array
    {
        return [...$this->store->defaults('clinic'), ...$this->section('clinic')];
    }

    public function consultation(): array
    {
        return [...$this->store->defaults('consultation'), ...$this->section('consultation')];
    }

    public function doctorProfile(): array
    {
        return $this->section('doctor');
    }

    /** Only gallery items with an uploaded image render on the site. */
    public function gallery(): array
    {
        return array_values(array_filter($this->section('gallery'), fn ($g) => ! empty($g['image'])));
    }

    public function testimonials(): array
    {
        return $this->section('testimonials');
    }

    public function homeFaqs(): array
    {
        return $this->section('faqs');
    }

    /** Home page videos; entries without a video are skipped. */
    public function homeVideos(): array
    {
        return array_values(array_filter($this->section('videos'), fn ($v) => ! empty($v['video'])));
    }
}
