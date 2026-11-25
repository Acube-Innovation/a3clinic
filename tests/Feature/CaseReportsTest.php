<?php

use App\Filament\Resources\CaseReports\Pages\CreateCaseReport;
use App\Filament\Resources\CaseReports\Pages\EditCaseReport;
use App\Mcp\Servers\SiteServer;
use App\Mcp\Tools\CreateRecord;
use App\Mcp\Tools\UpdateRecord;
use App\Models\User;
use App\Support\ContentStore;
use App\Support\SiteData;
use Database\Seeders\DefaultContentSeeder;
use Database\Seeders\SampleCaseReportsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Livewire\Livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DefaultContentSeeder::class);
    $this->store = app(ContentStore::class);
    $this->conditionSlug = $this->store->read('conditions')[0]['slug'];
});

/** A real (non-sample) case in its section shape. */
function realCase(array $overrides = []): array
{
    $photo = fn ($n) => [['view' => 'Front', 'image' => "/images/cases/placeholder-{$n}-front.jpg"]];

    return [
        'slug' => 'hf-2026-001', 'code' => 'HF-2026-001', 'title' => 'Diffuse shedding',
        'conditionSlug' => test()->conditionSlug, 'sex' => 'female', 'ageBand' => '30–35',
        'complaintDuration' => '1 year', 'followUp' => '6 months', 'summary' => 'Case summary.',
        'presentation' => 'Shedding.', 'history' => 'Stress.', 'assessment' => 'Pull test positive.',
        'approach' => ['Step one', 'Step two'], 'remedies' => '', 'outcome' => 'Less shedding.',
        'doctorNote' => '', 'consentOnFile' => true, 'consentDate' => '2026-10-01',
        'consentDocument' => 'consents/secret-form.pdf',
        'published' => true, 'featured' => true, 'sample' => false, 'noindex' => false,
        'stages' => [
            ['label' => 'Baseline', 'timepoint' => 'Week 0', 'note' => '', 'photos' => $photo('baseline')],
            ['label' => 'Review', 'timepoint' => 'Month 6', 'note' => '', 'photos' => $photo('month-6')],
        ],
        ...$overrides,
    ];
}

test('a published case renders its page, card and condition strip, without consent details', function () {
    $this->store->write('cases', [realCase()]);

    $this->get('/en/results')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('results/index')
            ->has('cases', 1)
            ->where('cases.0.cover.after', '/images/cases/placeholder-month-6-front.jpg')
            ->has('conditions', 1));

    $response = $this->get('/en/results/hf-2026-001')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('results/show')
            ->where('report.code', 'HF-2026-001')
            ->where('report.approach', ['Step one', 'Step two'])
            ->missing('report.consentDocument')
            ->missing('report.consentDate'));
    expect($response->getContent())->not->toContain('secret-form')->toContain('index, follow');

    $this->get("/en/conditions/{$this->conditionSlug}")
        ->assertInertia(fn (Assert $page) => $page->has('cases', 1));

    // Featured cases feed the home progress section.
    $this->get('/en')->assertInertia(fn (Assert $page) => $page
        ->where('resultPairs.0.href', '/results/hf-2026-001'));

    expect($this->get('/sitemap.xml')->getContent())->toContain('/en/results/hf-2026-001</loc>');
});

test('drafts and noindex cases stay out of the site and the sitemap respectively', function () {
    $this->store->write('cases', [
        realCase(['slug' => 'draft-1', 'code' => 'DRAFT-1', 'published' => false]),
        realCase(['slug' => 'quiet-1', 'code' => 'QUIET-1', 'noindex' => true]),
    ]);

    $this->get('/en/results/draft-1')->assertNotFound();
    // Signed-in staff can preview a draft; it stays out of search.
    $this->actingAs(User::factory()->create());
    expect($this->get('/en/results/draft-1')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('preview', true))
        ->getContent())->toContain('noindex, nofollow');
    auth()->logout();
    expect($this->get('/en/results/quiet-1')->assertOk()->getContent())->toContain('noindex, follow');

    $sitemap = $this->get('/sitemap.xml')->getContent();
    expect($sitemap)->not->toContain('draft-1')->not->toContain('quiet-1');
});

test('sample cases show outside production, and never in production', function () {
    $this->seed(SampleCaseReportsSeeder::class);
    config(['app.show_sample_cases' => true]);
    expect(app(SiteData::class)->cases())->not->toBeEmpty();
    $this->get('/en/results/sample-hf-01')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('report.sample', true));

    config(['app.show_sample_cases' => false]);
    app()->forgetInstance(SiteData::class);
    expect(app(SiteData::class)->cases())->toBe([]);
    $this->get('/en/results/sample-hf-01')->assertNotFound();
});

test('the sample seeder refuses to run in production', function () {
    app()->detectEnvironment(fn () => 'production');
    expect(fn () => (new SampleCaseReportsSeeder)->run($this->store))->toThrow(RuntimeException::class);
});

test('the admin will not publish a case without consent', function () {
    $this->actingAs(User::factory()->create());

    Livewire::test(CreateCaseReport::class)
        ->fillForm([
            'code' => 'HF-2026-002', 'conditionSlug' => $this->conditionSlug,
            'title' => 'Headline', 'summary' => 'Summary.', 'published' => true,
        ])
        ->call('create')
        ->assertHasFormErrors(['published']);

    Livewire::test(CreateCaseReport::class)
        ->fillForm([
            'code' => 'HF-2026-002', 'conditionSlug' => $this->conditionSlug,
            'title' => 'Headline', 'summary' => 'Summary.', 'published' => true,
            'consentOnFile' => true, 'consentDate' => '2026-11-01',
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $saved = $this->store->record('cases', 'hf-2026-002');
    expect($saved['published'])->toBeTrue()->and($saved['consentDate'])->toBe('2026-11-01');

    $this->get('/admin/case-reports')->assertOk();
    $this->get('/admin/case-reports/hf-2026-002/edit')->assertOk();
    $this->get('/admin/case-consent-form')->assertOk()->assertSee('withdraw this consent');

    Livewire::test(EditCaseReport::class, ['record' => 'hf-2026-002'])
        ->fillForm(['consentOnFile' => false])
        ->call('save')
        ->assertHasFormErrors(['published']);
});

test('the connector creates cases as drafts and enforces consent to publish', function () {
    $user = User::factory()->create();

    SiteServer::actingAs($user)->tool(CreateRecord::class, [
        'section' => 'cases', 'title' => 'HF-2026-003',
        'fields' => ['conditionSlug' => $this->conditionSlug, 'title' => 'Headline', 'published' => true,
            'stages' => [['label' => 'Baseline', 'photos' => [['view' => 'Front', 'image' => '/images/cases/placeholder-baseline-front.jpg']]]]],
    ])->assertOk()->assertHasNoErrors();
    expect($this->store->record('cases', 'hf-2026-003')['published'])->toBeFalse();

    SiteServer::actingAs($user)->tool(UpdateRecord::class, [
        'section' => 'cases', 'slug' => 'hf-2026-003', 'fields' => ['published' => true],
    ])->assertHasErrors(['signed consent']);

    SiteServer::actingAs($user)->tool(UpdateRecord::class, [
        'section' => 'cases', 'slug' => 'hf-2026-003', 'fields' => ['sample' => true],
    ])->assertHasErrors(['Unknown cases fields: sample']);

    SiteServer::actingAs($user)->tool(UpdateRecord::class, [
        'section' => 'cases', 'slug' => 'hf-2026-003',
        'fields' => ['published' => true, 'consentOnFile' => true, 'consentDate' => '2026-11-20'],
    ])->assertOk()->assertHasNoErrors();
    expect($this->store->record('cases', 'hf-2026-003')['published'])->toBeTrue();
});
