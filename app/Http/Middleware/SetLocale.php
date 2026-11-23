<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

/**
 * Applies the {locale} route segment (replaces the next-intl middleware in
 * src/proxy.ts). The NEXT_LOCALE cookie name is kept so existing visitors'
 * language choice carries over from the Next.js site.
 */
class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->route('locale');

        app()->setLocale($locale);
        URL::defaults(['locale' => $locale]);

        // Controllers never need the locale as an argument; it lives in app().
        $request->route()->forgetParameter('locale');

        return $next($request)->withCookie(cookie('NEXT_LOCALE', $locale, 60 * 24 * 365, httpOnly: false));
    }
}
