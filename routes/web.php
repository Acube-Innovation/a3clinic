<?php

use App\Http\Controllers\FormController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\UploadLinkController;
use App\Http\Middleware\SetLocale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/** The visitor's last-used locale (NEXT_LOCALE cookie, kept from the Next.js site), else English. */
$preferredLocale = function (Request $request): string {
    $locale = $request->cookie('NEXT_LOCALE');

    return in_array($locale, config('app.locales'), true) ? $locale : 'en';
};

Route::get('/', fn (Request $request) => redirect('/'.$preferredLocale($request), 307));

Route::get('sitemap.xml', SitemapController::class);

// Public form submissions; throttled per IP.
Route::middleware('throttle:5,1')->group(function () {
    Route::post('forms/booking', [FormController::class, 'booking']);
    Route::post('forms/enquiry', [FormController::class, 'enquiry']);
});

// One-time upload pages handed out by the Claude connector (signed, 30 min).
Route::middleware(['signed', 'throttle:60,1'])->group(function () {
    Route::get('upload/{link}', [UploadLinkController::class, 'show'])->name('upload-link.show');
    Route::post('upload/{link}', [UploadLinkController::class, 'store'])->name('upload-link.store');
});

Route::prefix('{locale}')
    ->where(['locale' => implode('|', config('app.locales'))])
    ->middleware(SetLocale::class)
    ->controller(PageController::class)
    ->group(function () {
        Route::get('/', 'home')->name('home');
        Route::get('about', 'about');
        Route::get('hair-treatment', 'hairTreatment');
        Route::get('consultation', 'consultation');
        Route::get('contact', 'contact');
        Route::get('book', 'book');
        Route::get('conditions', 'conditions');
        Route::get('conditions/{slug}', 'condition');
        Route::get('shop', 'shop');
        Route::get('shop/{slug}', 'product');
        Route::get('blog', 'blog');
        Route::get('blog/{slug}', 'post');
        Route::get('cart', 'cart');
        Route::get('portal', 'portal');
        Route::get('privacy', 'privacy');
        Route::get('terms', 'terms');
    });

// Unprefixed links (/shop, /blog/x) get the locale added, as next-intl did;
// anything else under a locale is a 404 rendered by the site's not-found page.
Route::fallback(function (Request $request) use ($preferredLocale) {
    $first = $request->segment(1);
    if ($request->isMethod('GET') && ! in_array($first, config('app.locales'), true)) {
        return redirect('/'.$preferredLocale($request).'/'.$request->path(), 307);
    }
    abort(404);
});
