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

    /** Complete before/after pairs (both photos present). */
    public static function pairsOf(array $condition): array
    {
        return array_values(array_filter($condition['results'] ?? [], fn ($r) => ! empty($r['before']) && ! empty($r['after'])));
    }

    /** Every complete pair across conditions; an empty label falls back to the condition name. */
    public function allResultPairs(): array
    {
        return collect($this->conditions())->flatMap(fn ($c) => array_map(
            fn ($pair) => [...$pair, 'label' => ($pair['label'] ?? '') !== '' ? $pair['label'] : $c['name']],
            self::pairsOf($c),
        ))->values()->all();
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
}
