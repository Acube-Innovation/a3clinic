<?php

use App\Filament\Pages\EditHomeVideos;
use App\Filament\Resources\Posts\Pages\EditPost;
use App\Filament\Support\Fields;
use App\Mcp\Servers\SiteServer;
use App\Mcp\Tools\CreateRecord;
use App\Mcp\Tools\GetContent;
use App\Mcp\Tools\ListChanges;
use App\Mcp\Tools\ListContent;
use App\Mcp\Tools\RevertChange;
use App\Mcp\Tools\UpdateRecord;
use App\Mcp\Tools\UpdateSection;
use App\Models\ContentChange;
use App\Models\User;
use App\Support\ContentStore;
use App\Support\VideoSource;
use Database\Seeders\DefaultContentSeeder;
use Illuminate\Http\UploadedFile;
use Livewire\Livewire;

const YT = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

beforeEach(function () {
    $this->seed(DefaultContentSeeder::class);
    $this->store = app(ContentStore::class);
    $this->user = User::factory()->create();
    $this->created = [];
});

afterEach(function () {
    foreach ($this->created as $path) {
        @unlink(public_path(ltrim($path, '/')));
    }
});

function mcp(string $method, array $params = [], ?string $token = null)
{
    return test()->withHeaders(array_filter([
        'Accept' => 'application/json, text/event-stream',
        'Authorization' => $token ? "Bearer {$token}" : null,
    ]))->postJson('/mcp', ['jsonrpc' => '2.0', 'id' => 1, 'method' => $method, 'params' => $params]);
}

// ------------------------------------------------------------------- access

test('the connector refuses requests without a valid token', function () {
    mcp('tools/list')->assertUnauthorized();
    mcp('tools/list', token: 'nope')->assertUnauthorized();
    $this->postJson('/api/media')->assertUnauthorized();
});

test('a token from connector:token lists the tools; revoking it locks it out', function () {
    $this->artisan('connector:token', ['name' => 'tester'])->assertSuccessful();
    $token = $this->user->createToken('tester')->plainTextToken;

    $names = collect(mcp('tools/list', token: $token)->assertOk()->json('result.tools'))->pluck('name');
    expect($names)->toContain('list_content', 'get_content', 'update_record', 'create_record', 'update_section',
        'upload_media_from_url', 'list_media', 'list_changes', 'revert_change');

    $this->artisan('connector:token', ['name' => 'tester', '--revoke' => true])->assertSuccessful();
    $this->app['auth']->forgetGuards();
    mcp('tools/list', token: $token)->assertUnauthorized();
});

// ------------------------------------------------------------------- tools

test('list_content and get_content return the site shape', function () {
    $slug = $this->store->read('conditions')[0]['slug'];

    SiteServer::actingAs($this->user)->tool(ListContent::class)->assertOk()->assertSee($slug);
    SiteServer::actingAs($this->user)->tool(GetContent::class, ['section' => 'conditions', 'slug' => $slug])
        ->assertOk()->assertSee('"symptoms"');
});

test('update_record changes only the fields sent, and logs the change', function () {
    $c = $this->store->read('conditions')[0];

    SiteServer::actingAs($this->user)->tool(UpdateRecord::class, [
        'section' => 'conditions', 'slug' => $c['slug'],
        'fields' => ['summary' => 'New summary.', 'video' => 'https://youtu.be/dQw4w9WgXcQ'],
    ])->assertOk()->assertHasNoErrors();

    $after = $this->store->record('conditions', $c['slug']);
    expect($after['summary'])->toBe('New summary.')
        ->and($after['video'])->toBe(YT)
        ->and($after['symptoms'])->toBe($c['symptoms'])
        ->and(ContentChange::count())->toBe(1);

    $this->get("/en/conditions/{$c['slug']}")->assertOk()->assertSee('New summary.')->assertSee('dQw4w9WgXcQ');
});

test('bad input is rejected with a readable error and nothing changes', function (array $fields, string $message) {
    $c = $this->store->read('conditions')[0];

    SiteServer::actingAs($this->user)->tool(UpdateRecord::class, ['section' => 'conditions', 'slug' => $c['slug'], 'fields' => $fields])
        ->assertHasErrors([$message]);

    expect($this->store->record('conditions', $c['slug']))->toBe($c)->and(ContentChange::count())->toBe(0);
})->with([
    'unknown field' => [['bogus' => 1], 'Unknown conditions fields: bogus'],
    'foreign video' => [['video' => 'https://evil.example/x.mp4'], 'Not a YouTube link'],
    'missing image' => [['heroImage' => '/uploads/missing.jpg'], 'No such file'],
    'remote image' => [['heroImage' => 'https://evil.example/x.jpg'], 'Images must be site paths'],
    'path traversal' => [['heroImage' => '/uploads/../../.env'], 'Images must be site paths'],
    'bad category' => [['category' => 'nope'], 'Invalid category'],
]);

test('create_record adds a post with a video block, and revert removes it', function () {
    $res = SiteServer::actingAs($this->user)->tool(CreateRecord::class, [
        'section' => 'posts', 'title' => 'Scalp care in monsoon',
        'fields' => ['category' => 'hair-tips', 'excerpt' => 'Short.', 'publishedAt' => '2026-11-25', 'readingMinutes' => 2,
            'body' => [['type' => 'paragraph', 'text' => 'Hello.'], ['type' => 'video', 'text' => 'https://www.youtube.com/shorts/dQw4w9WgXcQ']]],
    ])->assertOk()->assertHasNoErrors();

    $post = $this->store->record('posts', 'scalp-care-in-monsoon');
    expect($post['body'][1])->toBe(['type' => 'video', 'text' => YT]);
    $this->get('/en/blog/scalp-care-in-monsoon')->assertOk()->assertSee('dQw4w9WgXcQ');

    SiteServer::actingAs($this->user)->tool(RevertChange::class, ['id' => ContentChange::first()->id])->assertOk();
    expect($this->store->record('posts', 'scalp-care-in-monsoon'))->toBeNull();
});

test('update_section replaces lists, merges objects, and revert restores', function () {
    $before = $this->store->read('testimonials');

    SiteServer::actingAs($this->user)->tool(UpdateSection::class, [
        'section' => 'testimonials', 'items' => array_slice($before, 1),
    ])->assertOk();
    expect($this->store->read('testimonials'))->toHaveCount(count($before) - 1);

    $phone = $this->store->read('clinic')['phone'];
    SiteServer::actingAs($this->user)->tool(UpdateSection::class, ['section' => 'clinic', 'fields' => ['city' => 'Testville']])->assertOk();
    expect($this->store->read('clinic'))->city->toBe('Testville')->phone->toBe($phone);
    SiteServer::actingAs($this->user)->tool(UpdateSection::class, ['section' => 'clinic', 'fields' => ['nope' => 1]])
        ->assertHasErrors(['Unknown clinic keys: nope']);

    SiteServer::actingAs($this->user)->tool(ListChanges::class)->assertOk()->assertSee('testimonials');
    SiteServer::actingAs($this->user)->tool(RevertChange::class, ['id' => ContentChange::where('section', 'testimonials')->value('id')])->assertOk();
    expect($this->store->read('testimonials'))->toBe($before);
});

test('the home video section is hidden when there are no videos', function () {
    $this->get('/en')->assertOk()->assertDontSee('From the clinic');
});

test('home videos show on the home page', function () {
    SiteServer::actingAs($this->user)->tool(UpdateSection::class, [
        'section' => 'videos', 'items' => [['title' => 'Clinic tour', 'video' => 'https://youtu.be/dQw4w9WgXcQ']],
    ])->assertOk();

    expect($this->store->read('videos'))->toBe([['title' => 'Clinic tour', 'video' => YT]]);
    $this->get('/en')->assertOk()->assertSee('Clinic tour')->assertSee('dQw4w9WgXcQ');
});

// ------------------------------------------------------------------- media upload

test('images upload to /uploads and can be watermarked', function () {
    $token = $this->user->createToken('t')->plainTextToken;
    $upload = fn (array $extra = []) => $this->withToken($token)->post('/api/media', [
        'file' => UploadedFile::fake()->image('photo.jpg', 2400, 1600), ...$extra,
    ], ['Accept' => 'application/json']);

    $plain = $upload()->assertCreated()->assertJson(['type' => 'image'])->json();
    $this->created[] = $plain['path'];
    expect($plain['path'])->toMatch('#^/uploads/[0-9a-f-]{36}\.jpg$#')
        ->and(getimagesize(public_path($plain['path']))[0])->toBe(2000);

    $marked = $upload(['watermark' => '1'])->assertCreated()->json();
    $this->created[] = $marked['path'];
    expect(getimagesize(public_path($marked['path']))[0])->toBe(1600);
});

test('videos upload to /uploads/videos; scripts and other files are refused', function () {
    $token = $this->user->createToken('t')->plainTextToken;
    $mp4 = tempnam(sys_get_temp_dir(), 'v');
    // Minimal ISO-BMFF header: enough for finfo to call it video/mp4.
    file_put_contents($mp4, "\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00mp42isom".str_repeat("\x00", 64));

    $video = $this->withToken($token)->post('/api/media', ['file' => new UploadedFile($mp4, 'clip.mp4', 'video/mp4', null, true)], ['Accept' => 'application/json'])
        ->assertCreated()->assertJson(['type' => 'video'])->json();
    $this->created[] = $video['path'];
    expect($video['path'])->toMatch('#^/uploads/videos/[0-9a-f-]{36}\.mp4$#')
        ->and(VideoSource::isValid($video['path']))->toBeTrue();

    $script = UploadedFile::fake()->createWithContent('shell.jpg', '<?php system($_GET["c"]);');
    $this->withToken($token)->post('/api/media', ['file' => $script], ['Accept' => 'application/json'])
        ->assertStatus(422)->assertJsonFragment(['message' => 'Unsupported file type (text/x-php). Use JPEG, PNG or WebP images, or MP4/WebM videos.']);
});

// ------------------------------------------------------------------- admin

test('the home videos admin page saves YouTube links', function () {
    $this->actingAs($this->user);
    $this->get('/admin/videos')->assertOk();

    Livewire::test(EditHomeVideos::class)
        ->fillForm(['items' => [['title' => 'Tour', 'video' => 'https://youtu.be/dQw4w9WgXcQ']]], 'form')
        ->call('save')->assertHasNoErrors();

    expect($this->store->read('videos'))->toBe([['title' => 'Tour', 'video' => YT]]);
});

test('admin video fields reject links that are not YouTube', function () {
    $this->actingAs($this->user);
    $post = $this->store->read('posts')[0];

    Livewire::test(EditPost::class, ['record' => $post['slug']])
        ->fillForm(['body' => [['type' => 'video', 'text' => 'https://evil.example/x.mp4']]])
        ->call('save')->assertHasFormErrors();

    Livewire::test(EditPost::class, ['record' => $post['slug']])
        ->fillForm(['body' => [['type' => 'video', 'text' => 'https://youtu.be/dQw4w9WgXcQ']]])
        ->call('save')->assertHasNoFormErrors();
    expect($this->store->record('posts', $post['slug'])['body'])->toBe([['type' => 'video', 'text' => YT]]);
});

test('an admin video file upload replaces the typed link, at any depth', function () {
    $data = Fields::normalizeUploads([
        'video' => YT, 'videoUpload' => ['abc' => 'uploads/videos/x.mp4'],
        'body' => [['type' => 'video', 'text' => '', 'textUpload' => []], ['type' => 'paragraph', 'text' => 'Hi']],
        'image' => 'uploads/y.jpg',
    ]);

    expect($data)->toBe([
        'video' => '/uploads/videos/x.mp4',
        'body' => [['type' => 'video', 'text' => ''], ['type' => 'paragraph', 'text' => 'Hi']],
        'image' => '/uploads/y.jpg',
    ]);
});
