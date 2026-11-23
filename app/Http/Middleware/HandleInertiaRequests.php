<?php

namespace App\Http\Middleware;

use App\Support\SiteData;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            // Lazy: this middleware runs before the route's SetLocale middleware.
            'locale' => fn () => app()->getLocale(),
            'locales' => config('app.locales'),
            // Site chrome data (header menu, footer, contact buttons).
            'clinic' => fn () => app(SiteData::class)->clinic(),
            'navConditions' => fn () => collect(app(SiteData::class)->conditions())
                ->filter(fn ($c) => ! empty($c['featured']))
                ->map(fn ($c) => ['slug' => $c['slug'], 'name' => $c['name']])
                ->values(),
        ];
    }
}
