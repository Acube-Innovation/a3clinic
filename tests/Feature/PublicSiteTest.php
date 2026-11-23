<?php

use App\Models\Appointment;
use App\Models\Enquiry;
use App\Support\ContentStore;
use Database\Seeders\DefaultContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DefaultContentSeeder::class);
    $store = app(ContentStore::class);
    $this->condition = $store->read('conditions')[0];
    $this->product = $store->read('products')[0];
    $this->post = $store->read('posts')[0];
});

dataset('static pages', [
    ['/', 'home'], ['/about', 'about'], ['/hair-treatment', 'hair-treatment'], ['/consultation', 'consultation'],
    ['/contact', 'contact'], ['/book', 'book'], ['/conditions', 'conditions/index'], ['/shop', 'shop/index'],
    ['/blog', 'blog/index'], ['/cart', 'cart'], ['/portal', 'portal'], ['/privacy', 'privacy'], ['/terms', 'terms'],
]);

test('every public page renders in both locales', function (string $path, string $component) {
    foreach (['en', 'ml'] as $locale) {
        $this->get("/{$locale}".($path === '/' ? '' : $path))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component($component)
                ->where('locale', $locale)
                ->has('clinic.phone')
                ->has('navConditions')
                ->has('title'));
    }
})->with('static pages');

test('detail pages render their record and related items', function () {
    $this->get("/en/conditions/{$this->condition['slug']}")->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('conditions/show')
            ->where('condition.slug', $this->condition['slug'])->has('related'));
    $this->get("/en/shop/{$this->product['slug']}")->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('shop/show')
            ->where('product.slug', $this->product['slug'])->has('related'));
    $this->get("/en/blog/{$this->post['slug']}")->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('blog/show')
            ->where('post.slug', $this->post['slug'])->has('related', fn ($related) => $related->etc()));
});

test('listing pages send card fields only, not full condition records', function () {
    $this->get('/en/conditions')->assertInertia(fn (Assert $page) => $page
        ->has('conditions.0', fn (Assert $card) => $card->hasAll(['slug', 'name', 'category', 'summary'])
            ->missing('symptoms')->etc()));
});

test('unknown records and paths are 404s on the site not-found page', function (string $path) {
    $this->get($path)->assertNotFound()->assertInertia(fn (Assert $page) => $page->component('not-found'));
})->with(['/en/conditions/nope', '/en/shop/nope', '/en/blog/nope', '/en/nope', '/ml/also/nope']);

test('unprefixed paths get a locale, as next-intl did', function () {
    $this->get('/shop')->assertRedirect('/en/shop');
});

test('the first page load carries SEO metadata and JSON-LD in the html head', function () {
    $html = $this->get('/en/hair-treatment')->assertOk()->getContent();

    expect($html)
        ->toContain('<title inertia>Hair Treatment Programme — Homeopathy for Hair &amp; Scalp | Dr. Riji&#039;s Health Care</title>')
        ->toContain('<link rel="canonical" href="https://drrijishealthcare.com/en/hair-treatment">')
        ->toContain('hreflang="ml" href="https://drrijishealthcare.com/ml/hair-treatment"')
        ->toContain('<meta property="og:image" content="https://drrijishealthcare.com/og-image.png">')
        ->toContain('"@type":"FAQPage"')
        ->toContain('"@type":"BreadcrumbList"')
        ->toContain('"@type":["MedicalClinic","LocalBusiness"]');
});

test('the home title has no site-name suffix and private pages are noindex', function () {
    expect($this->get('/en')->getContent())
        ->toContain('<title inertia>Homeopathy for Hair, Skin &amp; Whole-body Wellness in Kattakkada, Kerala</title>');
    expect($this->get('/en/cart')->getContent())->toContain('<meta name="robots" content="noindex, follow">');
    expect($this->get('/en/portal')->getContent())->toContain('<meta name="robots" content="noindex, nofollow">');
});

test('product and post pages emit their structured data', function () {
    expect($this->get("/en/shop/{$this->product['slug']}")->getContent())->toContain('"@type":"Product"')->toContain('"priceCurrency":"INR"');
    expect($this->get("/en/blog/{$this->post['slug']}")->getContent())->toContain('"@type":"BlogPosting"')
        ->toContain('<meta property="og:type" content="article">');
});

test('the sitemap lists every route in both locales with alternates', function () {
    $xml = $this->get('/sitemap.xml')->assertOk()->assertHeader('Content-Type', 'application/xml')->getContent();
    $routes = 11 + count(app(ContentStore::class)->read('conditions')) + count(app(ContentStore::class)->read('products'))
        + count(app(ContentStore::class)->read('posts'));

    expect(substr_count($xml, '<url>'))->toBe($routes * 2)
        ->and($xml)->toContain("<loc>https://drrijishealthcare.com/ml/conditions/{$this->condition['slug']}</loc>")
        ->and($xml)->not->toContain('/cart</loc>');
});

// ------------------------------------------------------------------------- forms

$booking = fn (array $overrides = []) => [
    'mode' => 'online', 'concern' => 'hair-fall', 'date' => '2026-12-01', 'time' => '10:30',
    'name' => 'Test Patient', 'phone' => '+91 98765-43210', 'email' => 'patient@example.com',
    'age' => '34', 'gender' => 'female', 'notes' => 'Notes', 'files' => ['report.pdf'], ...$overrides,
];

test('a valid booking is stored first in the inbox with its files', function () use ($booking) {
    Appointment::create(['id' => 'A-older', 'position' => 0]);

    $this->postJson('/forms/booking', $booking())->assertOk()->assertExactJson(['ok' => true]);

    $latest = Appointment::orderBy('position')->first();
    expect($latest->id)->toStartWith('A-')->not->toBe('A-older')
        ->and($latest->status)->toBe('pending')
        ->and($latest->phone)->toBe('+919876543210')
        ->and($latest->created_at)->toMatch('/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/')
        ->and($latest->files->pluck('filename')->all())->toBe(['report.pdf'])
        ->and(Appointment::find('A-older')->position)->toBe(1);
});

test('invalid bookings are rejected with the old messages', function (array $overrides, string $error) use ($booking) {
    $this->postJson('/forms/booking', $booking($overrides))->assertUnprocessable()
        ->assertExactJson(['ok' => false, 'error' => $error]);
    expect(Appointment::count())->toBe(0);
})->with([
    'bad phone' => [['phone' => '12345'], 'Please check your name, phone and email.'],
    'bad email' => [['email' => 'nope'], 'Please check your name, phone and email.'],
    'no name' => [['name' => '  '], 'Please check your name, phone and email.'],
    'bad mode' => [['mode' => 'phone'], 'Please choose a consultation mode.'],
    'bad date' => [['date' => 'tomorrow'], 'Please choose a valid date and time.'],
]);

test('a valid enquiry is stored unread', function () {
    $this->postJson('/forms/enquiry', ['name' => 'Asha', 'phone' => '9876543210', 'email' => 'a@example.com', 'reason' => 'general', 'message' => 'Hello'])
        ->assertOk()->assertExactJson(['ok' => true]);

    expect(Enquiry::first())->read->toBeFalse()->message->toBe('Hello')->id->toStartWith('E-');
});

test('an enquiry without a message is rejected', function () {
    $this->postJson('/forms/enquiry', ['name' => 'Asha', 'phone' => '9876543210', 'message' => ''])
        ->assertUnprocessable()->assertJson(['ok' => false]);
});

test('form submissions are rate limited', function () use ($booking) {
    foreach (range(1, 5) as $i) {
        $this->postJson('/forms/booking', $booking());
    }
    $this->postJson('/forms/booking', $booking())->assertTooManyRequests();
});
