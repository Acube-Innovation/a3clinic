<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('the root redirects to english by default', function () {
    $this->get('/')->assertRedirect('/en')->assertStatus(307);
});

test('the root honours the locale cookie from the old site', function () {
    $this->withUnencryptedCookie('NEXT_LOCALE', 'ml')
        ->get('/')
        ->assertRedirect('/ml');
});

test('each locale renders the home page and remembers the choice', function (string $locale) {
    $this->get("/{$locale}")
        ->assertOk()
        ->assertCookie('NEXT_LOCALE', $locale, encrypted: false)
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->where('locale', $locale)
            ->where('locales', ['en', 'ml']));
})->with(['en', 'ml']);

test('unknown locales are treated as unprefixed paths, which then 404', function () {
    $this->get('/fr')->assertRedirect('/en/fr');
    $this->get('/en/fr')->assertNotFound();
});
