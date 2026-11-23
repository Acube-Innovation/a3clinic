<?php

use App\Models\Condition;
use App\Models\Lists\ConditionSymptom;
use App\Models\Post;
use App\Models\Section;
use App\Support\ContentStore;
use Database\Seeders\DefaultContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(fn () => $this->store = app(ContentStore::class));

/**
 * Saved content equals the defaults, except that the store always emits
 * optional fields the defaults may omit (featured: false, results: []…),
 * exactly as the Next.js repositories did.
 */
function expectSameContent(mixed $saved, mixed $defaults, string $path = '$'): void
{
    if (! is_array($defaults)) {
        expect($saved)->toEqual($defaults, $path);

        return;
    }
    expect($saved)->toBeArray($path);
    if (array_is_list($defaults)) {
        expect($saved)->toHaveCount(count($defaults), $path);
    }
    foreach ($saved as $key => $value) {
        if (array_key_exists($key, $defaults)) {
            expectSameContent($value, $defaults[$key], "{$path}.{$key}");
        } else {
            expect($value)->toBeIn([false, '', [], 0], "{$path}.{$key} is not an empty default");
        }
    }
    foreach (array_keys($defaults) as $key) {
        expect($saved)->toHaveKey($key, message: "{$path}.{$key} was lost");
    }
}

dataset('content sections', ['conditions', 'products', 'posts', 'testimonials', 'faqs', 'doctor', 'clinic', 'consultation', 'gallery']);

test('an unsaved section falls back to its defaults', function (string $section) {
    expect(Section::isInitialized($section))->toBeFalse()
        ->and($this->store->read($section))->toEqual($this->store->defaults($section));
})->with('content sections');

test('defaults survive a write and read round trip unchanged', function (string $section) {
    $defaults = $this->store->defaults($section);

    $this->store->write($section, $defaults);
    $saved = $this->store->read($section);

    expect(Section::isInitialized($section))->toBeTrue();
    expectSameContent($saved, $defaults);

    // Saving what was read back is a no-op.
    $this->store->write($section, $saved);
    expect($this->store->read($section))->toEqual($saved);
})->with('content sections');

test('inbox sections round trip', function () {
    $appointment = [
        'id' => 'apt_1', 'createdAt' => '2026-11-20T10:00:00.000Z', 'status' => 'new', 'mode' => 'online',
        'concern' => 'hair-fall', 'date' => '2026-11-25', 'time' => '10:30', 'name' => 'Test Patient',
        'phone' => '9999999999', 'email' => 'p@example.com', 'age' => '34', 'gender' => 'female',
        'notes' => 'Notes', 'files' => ['a.jpg', 'b.pdf'],
    ];
    $enquiry = [
        'id' => 'enq_1', 'createdAt' => '2026-11-20T10:00:00.000Z', 'read' => false, 'name' => 'Test',
        'phone' => '9999999999', 'email' => 'e@example.com', 'reason' => 'general', 'message' => 'Hello',
    ];

    $this->store->write('appointments', [$appointment]);
    $this->store->write('enquiries', [$enquiry]);

    expect($this->store->read('appointments'))->toEqual([$appointment])
        ->and($this->store->read('enquiries'))->toEqual([$enquiry]);
});

test('rewriting a collection removes dropped records and their children', function () {
    $conditions = $this->store->defaults('conditions');
    $this->store->write('conditions', $conditions);
    $dropped = $conditions[0]['slug'];

    $this->store->write('conditions', array_slice($conditions, 1));

    expect(Condition::find($dropped))->toBeNull()
        ->and(ConditionSymptom::where('condition_slug', $dropped)->count())->toBe(0)
        ->and(Condition::count())->toBe(count($conditions) - 1);
});

test('post list blocks keep their items', function () {
    $this->store->write('posts', $this->store->defaults('posts'));

    $listBlocks = DB::table('post_blocks')->where('type', 'list')->count();
    $withItems = DB::table('post_blocks')->where('type', 'list')
        ->whereExists(fn ($q) => $q->from('post_block_items')->whereColumn('block_id', 'post_blocks.id'))->count();

    expect(Post::count())->toBeGreaterThan(0)
        ->and($withItems)->toBe($listBlocks);
});

test('the default content seeder fills only unsaved sections', function () {
    $this->store->write('faqs', [['question' => 'Kept?', 'answer' => 'Yes']]);

    $this->seed(DefaultContentSeeder::class);

    expect($this->store->read('faqs'))->toBe([['question' => 'Kept?', 'answer' => 'Yes']])
        ->and(Section::isInitialized('conditions'))->toBeTrue()
        ->and(Section::isInitialized('appointments'))->toBeFalse();
    expectSameContent($this->store->read('conditions'), $this->store->defaults('conditions'));
});

test('unknown sections are rejected', function () {
    $this->store->read('nope');
})->throws(InvalidArgumentException::class);
