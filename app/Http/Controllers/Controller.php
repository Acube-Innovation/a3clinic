<?php

namespace App\Http\Controllers;

use App\Support\Seo;
use App\Support\SiteData;
use Inertia\Inertia;
use Inertia\Response;

abstract class Controller
{
    /**
     * Render a public page. $meta (Seo::page) and $schema (JSON-LD) are
     * printed into <head> by app.blade.php on the first, server-rendered
     * load; the page receives its full title for client-side navigations.
     */
    protected function page(string $component, array $props, array $meta, array $schema = []): Response
    {
        return Inertia::render($component, [...$props, 'title' => $meta['fullTitle']])
            ->withViewData([
                'seo' => $meta,
                'schema' => [...Seo::sitewide(app(SiteData::class)->clinic()), ...$schema],
            ]);
    }
}
