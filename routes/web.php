<?php

use App\Http\Middleware\SetLocale;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// "/" goes to the visitor's last-used locale (NEXT_LOCALE cookie, kept from the
// Next.js site so returning visitors land where they were), else English.
Route::get('/', function () {
    $locale = request()->cookie('NEXT_LOCALE');

    return redirect('/'.(in_array($locale, config('app.locales'), true) ? $locale : 'en'), 307);
});

Route::prefix('{locale}')
    ->where(['locale' => implode('|', config('app.locales'))])
    ->middleware(SetLocale::class)
    ->group(function () {
        Route::get('/', fn () => Inertia::render('home'))->name('home');
    });
