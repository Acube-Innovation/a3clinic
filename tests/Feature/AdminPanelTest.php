<?php

use App\Filament\Pages\EditClinic;
use App\Filament\Pages\EditDoctor;
use App\Filament\Pages\EditHomepageFaqs;
use App\Filament\Resources\Appointments\Pages\ListAppointments;
use App\Filament\Resources\Conditions\Pages\CreateCondition;
use App\Filament\Resources\Conditions\Pages\EditCondition;
use App\Filament\Resources\Enquiries\Pages\ViewEnquiry;
use App\Filament\Resources\Posts\Pages\EditPost;
use App\Filament\Resources\Products\Pages\CreateProduct;
use App\Filament\Resources\Products\Pages\EditProduct;
use App\Models\Appointment;
use App\Models\Condition;
use App\Models\Enquiry;
use App\Models\Product;
use App\Models\User;
use App\Support\ContentStore;
use App\Support\SiteData;
use App\Support\Watermark;
use Database\Seeders\DefaultContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DefaultContentSeeder::class);
    $this->store = app(ContentStore::class);
    $this->actingAs(User::factory()->create());
});

test('guests are sent to the admin login', function () {
    auth()->logout();
    $this->get('/admin')->assertRedirect('/admin/login');
    $this->get('/admin/login')->assertOk()->assertSee('Sign in');
});

test('every admin page renders', function (string $path) {
    $this->get($path)->assertOk();
})->with([
    '/admin', '/admin/conditions', '/admin/conditions/create', '/admin/products', '/admin/products/create',
    '/admin/posts', '/admin/posts/create', '/admin/testimonials', '/admin/testimonials/create',
    '/admin/appointments', '/admin/enquiries',
    '/admin/doctor', '/admin/clinic', '/admin/consultation', '/admin/faqs', '/admin/gallery',
]);

test('record edit pages open for every condition, product and post', function () {
    foreach (['conditions', 'products', 'posts'] as $section) {
        foreach ($this->store->read($section) as $record) {
            $this->get("/admin/{$section}/{$record['slug']}/edit")->assertOk();
        }
    }
});

test('editing a condition saves the form and keeps its other lists', function () {
    $condition = $this->store->read('conditions')[0];

    Livewire::test(EditCondition::class, ['record' => $condition['slug']])
        ->assertSchemaStateSet(['name' => $condition['name'], 'symptoms' => implode("\n", $condition['symptoms'])])
        ->fillForm(['name' => 'Edited name', 'symptoms' => "First symptom\n\n  Second symptom  "])
        ->call('save')
        ->assertHasNoFormErrors();

    $saved = $this->store->record('conditions', $condition['slug']);
    expect($saved['name'])->toBe('Edited name')
        ->and($saved['symptoms'])->toBe(['First symptom', 'Second symptom'])
        ->and($saved['faqs'])->toBe($condition['faqs'])
        ->and($saved['causes'])->toBe($condition['causes']);
});

test('creating a condition puts it first with a unique slug', function () {
    $existing = $this->store->read('conditions')[0];

    Livewire::test(CreateCondition::class)
        ->fillForm(['name' => $existing['name'], 'category' => 'skin', 'summary' => 'Summary.', 'intro' => 'Intro.'])
        ->call('create')
        ->assertHasNoFormErrors();

    $first = $this->store->read('conditions')[0];
    expect($first['slug'])->toBe($existing['slug'].'-2')
        ->and($first['category'])->toBe('skin')
        ->and($first['symptoms'])->toBe([]);
});

test('product prices are rupees in the form and paise in the content; ratings survive', function () {
    $product = $this->store->read('products')[0];

    Livewire::test(EditProduct::class, ['record' => $product['slug']])
        ->assertSchemaStateSet(['price' => $product['price'] / 100])
        ->fillForm(['price' => 499.5, 'compareAtPrice' => 0])
        ->call('save')
        ->assertHasNoFormErrors();

    $saved = $this->store->record('products', $product['slug']);
    expect($saved['price'])->toBe(49950)
        ->and($saved)->not->toHaveKey('compareAtPrice')
        ->and($saved['rating'])->toEqual($product['rating'])
        ->and($saved['reviews'])->toBe($product['reviews']);
});

test('a new product gets the blank rating and lists the site expects', function () {
    Livewire::test(CreateProduct::class)
        ->fillForm(['name' => 'Test Oil', 'category' => 'hair-oil', 'tagline' => 'T', 'description' => 'D', 'price' => 100, 'size' => '50 ml', 'caution' => 'C'])
        ->call('create')
        ->assertHasNoFormErrors();

    expect($this->store->record('products', 'test-oil'))
        ->price->toBe(10000)
        ->rating->toEqual(['value' => 0, 'count' => 0])
        ->reviews->toBe([]);
    $this->get('/en/shop/test-oil')->assertOk();
});

test('post list blocks round trip through the block editor', function () {
    $post = collect($this->store->read('posts'))->first(fn ($p) => collect($p['body'])->contains('type', 'list'));

    Livewire::test(EditPost::class, ['record' => $post['slug']])->call('save')->assertHasNoFormErrors();

    expect($this->store->record('posts', $post['slug'])['body'])->toEqual($post['body']);
});

test('deleting a condition removes it from the site', function () {
    $slug = $this->store->read('conditions')[0]['slug'];

    Livewire::test(EditCondition::class, ['record' => $slug])->callAction('delete');

    expect(Condition::find($slug))->toBeNull();
    $this->get("/en/conditions/{$slug}")->assertNotFound();
});

test('clinic settings save and show on the site', function () {
    Livewire::test(EditClinic::class)
        ->fillForm(['phone' => '9000012345'], 'form')
        ->call('save')
        ->assertHasNoErrors();

    app()->forgetScopedInstances();
    expect(app(SiteData::class)->clinic()['phone'])->toBe('9000012345');
    $this->get('/en/contact')->assertSee('+919000012345', false);
});

test('the doctor profile keeps its gallery slots when saved', function () {
    $before = $this->store->read('doctor');

    Livewire::test(EditDoctor::class)->fillForm(['missionText' => 'New mission'], 'form')->call('save');

    $after = $this->store->read('doctor');
    expect($after['mission']['mission'])->toBe('New mission')
        ->and($after['gallery'])->toBe($before['gallery'])
        ->and($after['biography'])->toBe($before['biography']);
});

test('homepage FAQs save as a plain list', function () {
    Livewire::test(EditHomepageFaqs::class)
        ->fillForm(['items' => [['question' => 'Q?', 'answer' => 'A.']]], 'form')
        ->call('save')
        ->assertHasNoErrors();

    expect($this->store->read('faqs'))->toBe([['question' => 'Q?', 'answer' => 'A.']]);
});

test('appointment status can be changed from the inbox', function () {
    $appointment = Appointment::create(['id' => 'A-1', 'name' => 'P', 'status' => 'pending', 'position' => 0]);

    Livewire::test(ListAppointments::class)
        ->assertCanSeeTableRecords([$appointment])
        ->call('updateTableColumnState', 'status', 'A-1', 'confirmed');

    expect($appointment->fresh()->status)->toBe('confirmed');
});

test('opening an enquiry marks it read', function () {
    Enquiry::create(['id' => 'E-1', 'name' => 'Asha', 'message' => 'Hi', 'read' => false, 'position' => 0]);

    Livewire::test(ViewEnquiry::class, ['record' => 'E-1'])->assertOk();

    expect(Enquiry::find('E-1')->read)->toBeTrue();
});

test('the watermark is baked into the pixels and large photos are capped', function () {
    $image = imagecreatetruecolor(2400, 1200);
    imagefill($image, 0, 0, imagecolorallocate($image, 30, 120, 90));
    $source = tempnam(sys_get_temp_dir(), 'wm');
    imagejpeg($image, $source, 95);

    $path = Watermark::store($source);
    $out = public_path($path);

    try {
        expect($path)->toMatch('#^uploads/[0-9a-f-]{36}\.jpg$#');
        [$w, $h] = getimagesize($out);
        expect([$w, $h])->toBe([1600, 800]);
        // The credit chip darkens the bottom-right corner of a flat image.
        $result = imagecreatefromjpeg($out);
        $corner = imagecolorsforindex($result, imagecolorat($result, $w - 140, $h - 29));
        expect($corner['green'])->toBeLessThan(100);
    } finally {
        @unlink($out);
        @unlink($source);
    }
});

test('existing images load into the form and survive a save unchanged', function () {
    // Point a condition and a product at files that exist on disk.
    $image = '/images/'.basename(collect(glob(public_path('images/*.jpg')))->first());
    $condition = $this->store->read('conditions')[0];
    $product = $this->store->read('products')[0];
    $this->store->saveRecord('conditions', $condition['slug'], ['introImage' => $image]);
    $this->store->saveRecord('products', $product['slug'], ['image' => $image]);

    $component = Livewire::test(EditCondition::class, ['record' => $condition['slug']]);
    expect(array_values($component->get('data.introImage')))->toBe([ltrim($image, '/')]);
    $component->call('save')->assertHasNoFormErrors();
    Livewire::test(EditProduct::class, ['record' => $product['slug']])->call('save')->assertHasNoFormErrors();

    expect($this->store->record('conditions', $condition['slug'])['introImage'])->toBe($image)
        ->and($this->store->record('products', $product['slug'])['image'])->toBe($image);
});
