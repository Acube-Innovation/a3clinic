<?php

namespace App\Http\Controllers;

use App\Support\Seo;
use App\Support\SiteData;
use Inertia\Response;

/**
 * Public pages. Each method mirrors a page in the Next.js app's
 * src/app/[locale] — the same data, titles, descriptions and JSON-LD.
 */
class PageController extends Controller
{
    public function __construct(private SiteData $data) {}

    public function home(): Response
    {
        return $this->page('home', [
            'conditions' => $this->data->conditionCards(),
            'resultPairs' => $this->data->allResultPairs(),
            'featuredProducts' => $this->data->featuredProducts(),
            'testimonials' => $this->data->testimonials(),
            'recentPosts' => $this->data->recentPosts(3),
            'faqs' => $this->data->homeFaqs(),
            'videos' => $this->data->homeVideos(),
        ], Seo::page(
            'Homeopathy for Hair, Skin & Whole-body Wellness in Kattakkada, Kerala',
            'Consult Dr. Riji Rasheed (BHMS) online or at the Kattakkada clinic for homeopathic treatment of hair fall, alopecia, dandruff, skin conditions, thyroid, PCOD and more.',
            '/',
            templated: false,
        ), [Seo::faq($this->data->homeFaqs())]);
    }

    public function about(): Response
    {
        return $this->page('about', [
            'profile' => $this->data->doctorProfile(),
            'photos' => $this->data->gallery(),
        ], Seo::page(
            'About Dr. Riji Rasheed (BHMS)',
            'Dr. Riji Rasheed, BHMS — homeopathic physician in Kattakkada, Kerala, with a clinical focus on hair and scalp disorders alongside general homeopathic practice.',
            '/about',
        ), [Seo::breadcrumb([['name' => 'About', 'href' => '/about']])]);
    }

    public function hairTreatment(): Response
    {
        $faqs = json_decode(file_get_contents(resource_path('js/data/hair-programme-faqs.json')), true);

        return $this->page('hair-treatment', [
            'conditions' => $this->data->conditionCards($this->data->featuredHairConditions()),
            'resultPairs' => $this->data->allResultPairs(),
            'featuredProducts' => $this->data->featuredProducts(),
        ], Seo::page(
            'Hair Treatment Programme — Homeopathy for Hair & Scalp',
            'Homeopathic treatment for hair fall, alopecia areata, dandruff, premature greying and hair thinning. Assessment, investigation, individualised prescription and structured follow-up with Dr. Riji Rasheed (BHMS).',
            '/hair-treatment',
        ), [Seo::faq($faqs), Seo::breadcrumb([['name' => 'Hair Treatment', 'href' => '/hair-treatment']])]);
    }

    public function consultation(): Response
    {
        return $this->page('consultation', [
            'content' => $this->data->consultation(),
            'faqs' => $this->data->homeFaqs(),
        ], Seo::page(
            'Online & Clinic Consultation',
            'Consult Dr. Riji Rasheed (BHMS) by video from anywhere, or in person at the Kattakkada clinic. How consultation works, what to prepare, and how medicines are delivered.',
            '/consultation',
        ), [Seo::breadcrumb([['name' => 'Consultation', 'href' => '/consultation']]), Seo::faq($this->data->homeFaqs())]);
    }

    public function contact(): Response
    {
        $clinic = $this->data->clinic();
        $digits = substr(Seo::phoneIntl($clinic['phone']), 3);
        $phoneDisplay = strlen($digits) === 10 ? '+91 '.substr($digits, 0, 5).' '.substr($digits, 5) : "+91 {$digits}";

        return $this->page('contact', [], Seo::page(
            'Contact the Clinic',
            "Contact Dr. Riji's Health Care, {$clinic['city']}, {$clinic['state']}. Call {$phoneDisplay}, message on WhatsApp, or send an enquiry.",
            '/contact',
        ), [Seo::breadcrumb([['name' => 'Contact', 'href' => '/contact']])]);
    }

    public function book(): Response
    {
        return $this->page('book', [], Seo::page(
            'Book an Appointment',
            'Book an online video consultation or an in-person appointment at the Kattakkada clinic with Dr. Riji Rasheed (BHMS).',
            '/book',
        ), [Seo::breadcrumb([['name' => 'Book Appointment', 'href' => '/book']])]);
    }

    public function conditions(): Response
    {
        return $this->page('conditions/index', [
            'conditions' => $this->data->conditionCards(),
        ], Seo::page(
            'Conditions Treated',
            "Homeopathic treatment for hair fall, alopecia, dandruff, skin disease, thyroid disorders, PCOD, allergies, migraine and children's health at Dr. Riji's Health Care, Kattakkada.",
            '/conditions',
        ), [Seo::breadcrumb([['name' => 'Conditions', 'href' => '/conditions']])]);
    }

    public function condition(string $slug): Response
    {
        $condition = $this->data->conditionBySlug($slug) ?? abort(404);
        $related = array_slice(array_values(array_filter(
            $this->data->conditions(),
            fn ($c) => $c['slug'] !== $condition['slug'] && $c['category'] === $condition['category'],
        )), 0, 3);
        $path = "/conditions/{$condition['slug']}";

        return $this->page('conditions/show', [
            'condition' => $condition,
            'related' => $this->data->conditionCards($related),
            'cases' => $this->data->caseCards($this->data->casesForCondition($condition['slug'])),
        ], Seo::page("{$condition['name']} — Homeopathic Treatment", $condition['summary'], $path), [
            Seo::medicalCondition($condition),
            ...($condition['faqs'] ? [Seo::faq($condition['faqs'])] : []),
            Seo::breadcrumb([['name' => 'Conditions', 'href' => '/conditions'], ['name' => $condition['name'], 'href' => $path]]),
        ]);
    }

    public function results(): Response
    {
        $cases = $this->data->cases();
        $conditionSlugs = array_unique(array_column($cases, 'conditionSlug'));

        return $this->page('results/index', [
            'cases' => $this->data->caseCards($cases),
            // Only conditions that have at least one case, for the filter.
            'conditions' => array_values(array_map(
                fn ($c) => ['slug' => $c['slug'], 'name' => $c['name'], 'category' => $c['category']],
                array_filter($this->data->conditions(), fn ($c) => in_array($c['slug'], $conditionSlugs, true)),
            )),
        ], Seo::page(
            'Patient Results & Case Reports',
            "Anonymised case reports from Dr. Riji's Health Care: how hair, skin and chronic conditions were assessed, treated and documented over time. Published with written patient consent. Results vary.",
            '/results',
        ), [Seo::breadcrumb([['name' => 'Patient Results', 'href' => '/results']])]);
    }

    public function caseReport(string $slug): Response
    {
        $case = $this->data->caseBySlug($slug);
        // Signed-in clinic staff can preview drafts; visitors get a 404.
        $preview = ! $case && auth()->check();
        $case ??= ($preview ? $this->data->caseForPreview($slug) : null) ?? abort(404);
        $path = "/results/{$case['slug']}";
        $condition = $this->data->conditionBySlug($case['conditionSlug']);
        $title = $case['conditionName'] ? "{$case['title']} — {$case['conditionName']} Case Report" : "{$case['title']} — Case Report";

        return $this->page('results/show', [
            'report' => $case,
            'preview' => $preview,
            'condition' => $condition ? $this->data->conditionCards([$condition])[0] : null,
            'related' => $this->data->caseCards($this->data->relatedCases($case)),
        ], Seo::page(
            $title,
            $case['summary'] ?: "Anonymised case report ({$case['code']}) from Dr. Riji's Health Care. Results vary from person to person.",
            $path,
            type: 'article',
            // Placeholder cases and cases the clinic marks private stay out of search.
            robots: match (true) {
                $preview => 'noindex, nofollow',
                ! empty($case['noindex']) || ! empty($case['sample']) => 'noindex, follow',
                default => null,
            },
        ), [Seo::breadcrumb([
            ['name' => 'Patient Results', 'href' => '/results'],
            ['name' => $case['code'], 'href' => $path],
        ])]);
    }

    public function shop(): Response
    {
        return $this->page('shop/index', [
            'products' => $this->data->products(),
            'categories' => $this->data->activeCategories(),
        ], Seo::page(
            'Shop — Doctor Formulated Hair & Skin Care',
            'Hair oil, scalp serum, shampoo, conditioner and skin care formulated by Dr. Riji Rasheed (BHMS). Full ingredient lists, no mineral oil, no added fragrance.',
            '/shop',
        ), [Seo::breadcrumb([['name' => 'Shop', 'href' => '/shop']])]);
    }

    public function product(string $slug): Response
    {
        $product = $this->data->productBySlug($slug) ?? abort(404);
        $path = "/shop/{$product['slug']}";

        return $this->page('shop/show', [
            'product' => $product,
            'related' => $this->data->relatedProducts($slug),
        ], Seo::page("{$product['name']} — {$product['size']}", $product['tagline'], $path), [
            Seo::product($product),
            Seo::breadcrumb([['name' => 'Shop', 'href' => '/shop'], ['name' => $product['name'], 'href' => $path]]),
        ]);
    }

    public function blog(): Response
    {
        return $this->page('blog/index', [
            'posts' => $this->data->posts(),
        ], Seo::page(
            'Clinic Journal — Hair, Skin & Homeopathy',
            "Evidence-informed articles on hair care, homeopathy, nutrition, women's health and children's health from Dr. Riji's Health Care, Kattakkada.",
            '/blog',
        ), [Seo::breadcrumb([['name' => 'Blog', 'href' => '/blog']])]);
    }

    public function post(string $slug): Response
    {
        $post = $this->data->postBySlug($slug) ?? abort(404);
        $path = "/blog/{$post['slug']}";

        return $this->page('blog/show', [
            'post' => $post,
            'related' => $this->data->relatedPosts($slug, 3),
        ], Seo::page($post['title'], $post['excerpt'], $path, type: 'article', publishedTime: $post['publishedAt']), [
            Seo::blogPosting($post),
            Seo::breadcrumb([['name' => 'Blog', 'href' => '/blog'], ['name' => $post['title'], 'href' => $path]]),
        ]);
    }

    public function cart(): Response
    {
        // A personal, session-specific page — keep it out of the index.
        return $this->page('cart', [], Seo::page(
            'Your Cart', 'Review the products in your cart before checkout.', '/cart', robots: 'noindex, follow',
        ));
    }

    public function portal(): Response
    {
        // Never index a page that will hold personal health information.
        return $this->page('portal', [], Seo::page(
            'Patient Portal', 'View your appointments, prescriptions, orders, reports and invoices.', '/portal', robots: 'noindex, nofollow',
        ));
    }

    public function privacy(): Response
    {
        return $this->page('privacy', [], Seo::page(
            'Privacy Policy', 'How '.Seo::SITE_NAME.' collects, uses and protects your personal and health information.', '/privacy',
        ));
    }

    public function terms(): Response
    {
        return $this->page('terms', [], Seo::page(
            'Terms of Service', 'The terms on which '.Seo::SITE_NAME.' provides consultation, products and this website.', '/terms',
        ));
    }
}
