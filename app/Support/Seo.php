<?php

namespace App\Support;

/**
 * Page metadata and JSON-LD, ported from src/lib/seo.ts. Everything here is
 * rendered server-side into <head> by resources/views/app.blade.php, so
 * crawlers see it without running JavaScript.
 */
class Seo
{
    public const SITE_NAME = "Dr. Riji's Health Care";

    public const SITE_DESCRIPTION = 'Homeopathic care for hair fall, scalp disorders, skin conditions and chronic illness. Consult Dr. Riji Rasheed (BHMS) online or at the Kattakkada clinic.';

    public const DOCTOR = ['name' => 'Dr. Riji Rasheed', 'credentials' => 'BHMS', 'role' => 'Homeopathic Physician'];

    public const SOCIAL = [
        'https://instagram.com/drrijishealthcare',
        'https://facebook.com/drrijishealthcare',
        'https://youtube.com/@drrijishealthcare',
    ];

    private const GEO = ['lat' => 8.4167, 'lng' => 77.0667];

    private const OPENING_HOURS = [
        [['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], '09:00', '13:00'],
        [['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], '16:00', '19:30'],
    ];

    public static function url(): string
    {
        return rtrim(config('app.site_url'), '/');
    }

    private static function localized(string $locale, string $path): string
    {
        return self::url()."/{$locale}".($path === '/' ? '' : $path);
    }

    /**
     * Page metadata (pageMetadata() in seo.ts).
     *
     * @param  bool  $templated  false for the home page, whose title is used as is
     */
    public static function page(
        string $title,
        string $description,
        string $path,
        string $type = 'website',
        ?string $publishedTime = null,
        ?string $image = null,
        ?string $robots = null,
        bool $templated = true,
    ): array {
        $locale = app()->getLocale();
        $canonical = self::localized($locale, $path);

        return [
            'title' => $title,
            'fullTitle' => $templated ? "{$title} | ".self::SITE_NAME : $title,
            'description' => $description,
            'robots' => $robots ?? 'index, follow',
            'canonical' => $canonical,
            'alternates' => [
                'en' => self::localized('en', $path),
                'ml' => self::localized('ml', $path),
                'x-default' => self::localized('en', $path),
            ],
            'og' => array_filter([
                'type' => $type,
                'url' => $canonical,
                'locale' => $locale === 'ml' ? 'ml_IN' : 'en_IN',
                'image' => self::url().($image ?? '/og-image.png'),
                'published_time' => $publishedTime,
            ]),
        ];
    }

    // ------------------------------------------------------------------ JSON-LD

    private static function orgId(): string
    {
        return self::url().'/#organization';
    }

    private static function doctorId(): string
    {
        return self::url().'/#physician';
    }

    /** +91 followed by the 10-digit number (phoneIntlOf in site.ts). */
    public static function phoneIntl(string $raw): string
    {
        return '+91'.preg_replace('/^91(?=\d{10}$)/', '', preg_replace('/\D/', '', $raw));
    }

    private static function postalAddress(array $clinic): array
    {
        return [
            '@type' => 'PostalAddress',
            'streetAddress' => "{$clinic['addressLine1']}, {$clinic['addressLine2']}",
            'addressLocality' => $clinic['city'],
            'addressRegion' => $clinic['state'],
            'postalCode' => $clinic['postalCode'],
            'addressCountry' => 'IN',
        ];
    }

    /** Sitewide graph emitted on every page (the Next.js locale layout). */
    public static function sitewide(array $clinic): array
    {
        return [self::website(), self::medicalClinic($clinic), self::physician($clinic)];
    }

    public static function medicalClinic(array $clinic): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => ['MedicalClinic', 'LocalBusiness'],
            '@id' => self::orgId(),
            'name' => self::SITE_NAME,
            'description' => self::SITE_DESCRIPTION,
            'url' => self::url(),
            'telephone' => self::phoneIntl($clinic['phone']),
            'email' => $clinic['email'],
            'address' => self::postalAddress($clinic),
            'geo' => ['@type' => 'GeoCoordinates', 'latitude' => self::GEO['lat'], 'longitude' => self::GEO['lng']],
            'openingHoursSpecification' => array_map(fn ($slot) => [
                '@type' => 'OpeningHoursSpecification', 'dayOfWeek' => $slot[0], 'opens' => $slot[1], 'closes' => $slot[2],
            ], self::OPENING_HOURS),
            'priceRange' => '₹₹',
            'currenciesAccepted' => 'INR',
            'medicalSpecialty' => 'Dermatology',
            'availableService' => array_map(fn ($name) => ['@type' => 'MedicalTherapy', 'name' => $name], [
                'Homeopathic hair and scalp treatment',
                'Homeopathic treatment for skin conditions',
                'Chronic disease management',
                "Women's health consultation",
                'Paediatric homeopathy',
            ]),
            'sameAs' => self::SOCIAL,
        ];
    }

    public static function physician(array $clinic): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Physician',
            '@id' => self::doctorId(),
            'name' => self::DOCTOR['name'],
            'honorificSuffix' => self::DOCTOR['credentials'],
            'jobTitle' => self::DOCTOR['role'],
            'medicalSpecialty' => 'Dermatology',
            'url' => self::url().'/en/about',
            'telephone' => self::phoneIntl($clinic['phone']),
            'address' => self::postalAddress($clinic),
            'worksFor' => ['@id' => self::orgId()],
            'memberOf' => ['@id' => self::orgId()],
            'knowsAbout' => [
                'Homeopathy', 'Hair fall treatment', 'Alopecia areata', 'Dandruff and seborrhoeic dermatitis',
                'Skin disorders', 'Thyroid disorders', 'PCOD',
            ],
        ];
    }

    public static function website(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            '@id' => self::url().'/#website',
            'url' => self::url(),
            'name' => self::SITE_NAME,
            'publisher' => ['@id' => self::orgId()],
            'inLanguage' => ['en-IN', 'ml-IN'],
        ];
    }

    public static function product(array $p): array
    {
        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $p['name'],
            'description' => $p['description'],
            'sku' => $p['slug'],
            'brand' => ['@type' => 'Brand', 'name' => self::SITE_NAME],
            'image' => ! empty($p['image']) ? [self::url().$p['image']] : null,
            'offers' => [
                '@type' => 'Offer',
                'url' => self::url()."/en/shop/{$p['slug']}",
                'priceCurrency' => 'INR',
                'price' => number_format($p['price'] / 100, 2, '.', ''),
                'availability' => $p['inStock'] ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                'seller' => ['@id' => self::orgId()],
            ],
            'aggregateRating' => isset($p['rating']) ? [
                '@type' => 'AggregateRating',
                'ratingValue' => $p['rating']['value'],
                'reviewCount' => $p['rating']['count'],
            ] : null,
        ], fn ($v) => $v !== null);
    }

    public static function faq(array $items): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => array_map(fn ($item) => [
                '@type' => 'Question',
                'name' => $item['question'],
                'acceptedAnswer' => ['@type' => 'Answer', 'text' => $item['answer']],
            ], $items),
        ];
    }

    public static function blogPosting(array $post): array
    {
        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'BlogPosting',
            'headline' => $post['title'],
            'description' => $post['excerpt'],
            'datePublished' => $post['publishedAt'],
            'dateModified' => $post['publishedAt'],
            'author' => ['@id' => self::doctorId()],
            'publisher' => ['@id' => self::orgId()],
            'mainEntityOfPage' => self::url()."/en/blog/{$post['slug']}",
            'image' => ! empty($post['image']) ? [self::url().$post['image']] : null,
        ], fn ($v) => $v !== null);
    }

    /** @param  array<int, array{name: string, href: string}>  $crumbs */
    public static function breadcrumb(array $crumbs): array
    {
        $locale = app()->getLocale();

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => array_map(fn ($crumb, $i) => [
                '@type' => 'ListItem',
                'position' => $i + 1,
                'name' => $crumb['name'],
                'item' => self::localized($locale, $crumb['href']),
            ], $crumbs, array_keys($crumbs)),
        ];
    }

    public static function medicalCondition(array $condition): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'MedicalCondition',
            'name' => $condition['name'],
            'description' => $condition['summary'],
            'signOrSymptom' => array_map(fn ($s) => ['@type' => 'MedicalSymptom', 'name' => $s], $condition['symptoms']),
            'cause' => array_map(fn ($c) => ['@type' => 'MedicalCause', 'name' => $c], $condition['causes']),
            'possibleTreatment' => [
                '@type' => 'MedicalTherapy',
                'name' => 'Individualised homeopathic treatment',
                'provider' => ['@id' => self::orgId()],
            ],
        ];
    }
}
