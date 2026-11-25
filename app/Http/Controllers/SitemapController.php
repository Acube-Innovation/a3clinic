<?php

namespace App\Http\Controllers;

use App\Support\Seo;
use App\Support\SiteData;
use Illuminate\Http\Response;

/**
 * Every public route in both locales, each with hreflang alternates so search
 * engines treat /en and /ml as translations (port of src/app/sitemap.ts).
 * /cart and /portal are excluded — both are noindex.
 */
class SitemapController extends Controller
{
    private const ROUTES = [
        ['', 1, 'weekly'],
        ['/hair-treatment', 0.9, 'monthly'],
        ['/conditions', 0.8, 'monthly'],
        ['/results', 0.7, 'monthly'],
        ['/shop', 0.8, 'weekly'],
        ['/consultation', 0.8, 'monthly'],
        ['/book', 0.9, 'monthly'],
        ['/about', 0.7, 'yearly'],
        ['/blog', 0.7, 'weekly'],
        ['/contact', 0.7, 'yearly'],
        ['/privacy', 0.3, 'yearly'],
        ['/terms', 0.3, 'yearly'],
    ];

    public function __invoke(SiteData $data): Response
    {
        $routes = [
            ...self::ROUTES,
            ...array_map(fn ($c) => ["/conditions/{$c['slug']}", 0.8, 'monthly'], $data->conditions()),
            ...array_map(fn ($c) => ["/results/{$c['slug']}", 0.6, 'monthly'], array_filter(
                $data->cases(), fn ($c) => empty($c['noindex']) && empty($c['sample']),
            )),
            ...array_map(fn ($p) => ["/shop/{$p['slug']}", 0.7, 'weekly'], $data->products()),
            ...array_map(fn ($p) => ["/blog/{$p['slug']}", 0.6, 'monthly'], $data->posts()),
        ];

        $site = Seo::url();
        $locales = config('app.locales');
        $lastmod = now('UTC')->format('Y-m-d\TH:i:s.v\Z');
        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'."\n";

        foreach ($routes as [$path, $priority, $frequency]) {
            foreach ($locales as $locale) {
                $xml .= "<url>\n<loc>".e("{$site}/{$locale}{$path}")."</loc>\n";
                foreach ($locales as $alt) {
                    $xml .= '<xhtml:link rel="alternate" hreflang="'.$alt.'" href="'.e("{$site}/{$alt}{$path}").'" />'."\n";
                }
                $xml .= "<lastmod>{$lastmod}</lastmod>\n<changefreq>{$frequency}</changefreq>\n<priority>{$priority}</priority>\n</url>\n";
            }
        }

        return response($xml.'</urlset>'."\n", 200, ['Content-Type' => 'application/xml']);
    }
}
