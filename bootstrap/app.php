<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Support\Seo;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Plain-text cookie shared with the old Next.js site (see SetLocale).
        $middleware->encryptCookies(except: ['NEXT_LOCALE']);

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Public 404s render the site's own not-found page inside the normal
        // chrome (the Next.js [locale]/not-found.tsx), in the URL's locale.
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->expectsJson() || $request->is('admin', 'admin/*')) {
                return null;
            }
            $locale = $request->segment(1);
            app()->setLocale(in_array($locale, config('app.locales'), true) ? $locale : 'en');

            return Inertia::render('not-found', ['title' => 'Page not found | '.Seo::SITE_NAME])
                ->withViewData(['seo' => [
                    ...Seo::page('Page not found', Seo::SITE_DESCRIPTION, '/'),
                    'fullTitle' => 'Page not found | '.Seo::SITE_NAME,
                    'robots' => 'noindex, follow',
                ]])
                ->toResponse($request)
                ->setStatusCode(404);
        });
    })->create();

// GoDaddy shared hosting: the web root is ~/public_html beside the app
// checkout in ~/a3clinic (see deploy/README.md). There, public files and
// admin uploads live in public_html; locally and in tests, public/ as usual.
if (is_file($webRoot = dirname(__DIR__, 2).'/public_html/index.php')) {
    $app->usePublicPath(dirname($webRoot));
}

return $app;
