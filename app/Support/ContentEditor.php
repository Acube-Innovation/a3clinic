<?php

namespace App\Support;

use App\Filament\Resources\Conditions\Schemas\ConditionForm;
use App\Filament\Resources\Posts\Schemas\PostForm;
use App\Filament\Resources\Products\Schemas\ProductForm;
use App\Models\ContentChange;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Content edits made through the Claude connector: validated against the
 * same rules as the admin forms, written through ContentStore, and logged in
 * content_changes so any edit can be reverted.
 */
final class ContentEditor
{
    /** Collections edited one record at a time, and the fields a record may carry. */
    public const RECORD_FIELDS = [
        'conditions' => ['name', 'category', 'featured', 'summary', 'intro', 'heroImage', 'introImage', 'video',
            'symptoms', 'causes', 'treatment', 'expectedResults', 'faqs', 'results'],
        'products' => ['name', 'category', 'tagline', 'description', 'price', 'compareAtPrice', 'size', 'inStock',
            'featured', 'bestseller', 'caution', 'image', 'video', 'benefits', 'ingredients', 'directions',
            'rating', 'reviews', 'related'],
        'posts' => ['title', 'category', 'excerpt', 'publishedAt', 'readingMinutes', 'featured', 'image', 'body'],
    ];

    /** Sections saved whole: lists are replaced, objects are merged key by key. */
    public const LIST_SECTIONS = ['testimonials', 'faqs', 'gallery', 'videos'];

    public const OBJECT_SECTIONS = ['doctor', 'clinic', 'consultation'];

    public const BLOCK_TYPES = ['paragraph', 'heading', 'list', 'callout', 'video'];

    public function __construct(private ContentStore $store) {}

    public static function editableSections(): array
    {
        return [...array_keys(self::RECORD_FIELDS), ...self::LIST_SECTIONS, ...self::OBJECT_SECTIONS];
    }

    /** Merge $fields into one record; returns the saved record. */
    public function updateRecord(string $section, string $slug, array $fields, ?string $actor): array
    {
        $this->assertRecordSection($section);
        $before = $this->store->record($section, $slug) ?? throw new InvalidArgumentException("No {$section} record with slug \"{$slug}\".");
        $fields = $this->cleanRecord($section, $fields);

        return $this->logged($section, $slug, 'update', $before, function () use ($section, $slug, $fields) {
            $this->store->saveRecord($section, $slug, $fields);

            return $this->store->record($section, $slug);
        }, $actor);
    }

    /** Create a record at the top of its collection; returns it (with its new slug). */
    public function createRecord(string $section, string $title, array $fields, ?string $actor): array
    {
        $this->assertRecordSection($section);
        $titleKey = $section === 'posts' ? 'title' : 'name';
        $fields = $this->cleanRecord($section, [...$fields, $titleKey => $title]);
        if (! isset($fields['category'])) {
            throw new InvalidArgumentException('A new record needs a category: '.implode(', ', array_keys(self::categories($section))));
        }

        $slug = null;

        return $this->logged($section, null, 'create', null, function () use ($section, $title, $fields, &$slug) {
            $slug = $this->store->createRecord($section, $title, $fields);

            return $this->store->record($section, $slug);
        }, $actor, function () use (&$slug) {
            return $slug;
        });
    }

    /** Replace a list section, or merge keys into an object section; returns the saved section. */
    public function updateSection(string $section, array $data, ?string $actor): array
    {
        $before = $this->store->read($section);

        if (in_array($section, self::LIST_SECTIONS, true)) {
            if (! array_is_list($data)) {
                throw new InvalidArgumentException("\"{$section}\" is a list: send the full array of items (get_content first, then edit).");
            }
            $data = array_map(fn ($item) => $this->cleanListItem($section, $item), $data);
        } elseif (in_array($section, self::OBJECT_SECTIONS, true)) {
            if (array_is_list($data) && $data !== []) {
                throw new InvalidArgumentException("\"{$section}\" is an object: send the keys to change.");
            }
            $unknown = array_diff(array_keys($data), array_keys($before));
            if ($unknown) {
                throw new InvalidArgumentException("Unknown {$section} keys: ".implode(', ', $unknown).'. Allowed: '.implode(', ', array_keys($before)));
            }
            $data = [...$before, ...$data];
        } else {
            throw new InvalidArgumentException("Section \"{$section}\" can't be edited here. Use update_record for conditions, products and posts.");
        }

        return $this->logged($section, null, 'update', $before, function () use ($section, $data) {
            $this->store->write($section, $data);

            return $this->store->read($section);
        }, $actor);
    }

    /** Put content back the way it was before change $id. */
    public function revert(int $id, ?string $actor): ContentChange
    {
        $change = ContentChange::findOrFail($id);
        $section = $change->section;

        DB::transaction(function () use ($change, $section) {
            if (isset(self::RECORD_FIELDS[$section])) {
                $records = collect($this->store->read($section));
                if ($change->before === null) {
                    // Undo a create: drop the record.
                    $this->store->write($section, $records->reject(fn ($r) => $r['slug'] === $change->slug)->values()->all());
                } elseif ($records->contains('slug', $change->slug)) {
                    $this->store->saveRecord($section, $change->slug, $change->before);
                } else {
                    $this->store->write($section, [$change->before, ...$records->all()]);
                }
            } else {
                $this->store->write($section, $change->before ?? []);
            }
        });
        app()->forgetScopedInstances();

        return ContentChange::create([
            'section' => $section,
            'slug' => $change->slug,
            'action' => "revert #{$change->id}",
            'before' => $change->after,
            'after' => $change->before,
            'actor' => $actor,
        ]);
    }

    // ------------------------------------------------------------------ helpers

    private function logged(string $section, ?string $slug, string $action, mixed $before, \Closure $write, ?string $actor, ?\Closure $slugAfter = null): array
    {
        $after = DB::transaction($write);
        app()->forgetScopedInstances();

        $change = ContentChange::create([
            'section' => $section,
            'slug' => $slug ?? ($slugAfter ? $slugAfter() : null),
            'action' => $action,
            'before' => $before,
            'after' => $after,
            'actor' => $actor,
        ]);

        return ['changeId' => $change->id, 'data' => $after];
    }

    private function assertRecordSection(string $section): void
    {
        if (! isset(self::RECORD_FIELDS[$section])) {
            throw new InvalidArgumentException('Records exist only in: '.implode(', ', array_keys(self::RECORD_FIELDS)).". Use update_section for \"{$section}\".");
        }
    }

    private static function categories(string $section): array
    {
        return match ($section) {
            'conditions' => ConditionForm::CATEGORIES,
            'products' => ProductForm::CATEGORIES,
            'posts' => PostForm::CATEGORIES,
        };
    }

    private function cleanRecord(string $section, array $fields): array
    {
        unset($fields['slug']);
        $unknown = array_diff(array_keys($fields), self::RECORD_FIELDS[$section]);
        if ($unknown) {
            throw new InvalidArgumentException("Unknown {$section} fields: ".implode(', ', $unknown).'. Allowed: '.implode(', ', self::RECORD_FIELDS[$section]));
        }

        if (isset($fields['category']) && ! isset(self::categories($section)[$fields['category']])) {
            throw new InvalidArgumentException("Invalid category \"{$fields['category']}\". Use one of: ".implode(', ', array_keys(self::categories($section))));
        }

        foreach (['heroImage', 'introImage', 'image'] as $key) {
            if (array_key_exists($key, $fields)) {
                $fields[$key] = self::image($fields[$key]);
            }
        }
        if (array_key_exists('video', $fields)) {
            $fields['video'] = VideoSource::normalize($fields['video']);
        }
        if (isset($fields['results'])) {
            $fields['results'] = array_map(fn ($r) => [
                ...$r,
                'before' => self::image($r['before'] ?? '', required: true),
                'after' => self::image($r['after'] ?? '', required: true),
            ], self::listOf($fields['results'], 'results'));
        }
        if (isset($fields['body'])) {
            $fields['body'] = array_map(function ($b) {
                $type = $b['type'] ?? null;
                if (! in_array($type, self::BLOCK_TYPES, true)) {
                    throw new InvalidArgumentException('Block type must be one of: '.implode(', ', self::BLOCK_TYPES));
                }

                return match ($type) {
                    'list' => ['type' => 'list', 'items' => array_values(array_map('strval', self::listOf($b['items'] ?? [], 'list items')))],
                    'video' => ['type' => 'video', 'text' => VideoSource::normalize($b['text'] ?? '') ?: throw new InvalidArgumentException('A video block needs a YouTube link or /uploads/videos/… path in "text".')],
                    default => ['type' => $type, 'text' => (string) ($b['text'] ?? '')],
                };
            }, self::listOf($fields['body'], 'body'));
        }

        return $fields;
    }

    private function cleanListItem(string $section, mixed $item): array
    {
        if (! is_array($item)) {
            throw new InvalidArgumentException("Each {$section} item must be an object.");
        }

        return match ($section) {
            'gallery' => [...$item, 'image' => self::image($item['image'] ?? '', required: true)],
            'videos' => [...$item, 'video' => VideoSource::normalize($item['video'] ?? '') ?: throw new InvalidArgumentException('Each video needs a YouTube link or /uploads/videos/… path.')],
            default => $item,
        };
    }

    private static function listOf(mixed $value, string $what): array
    {
        if (! is_array($value) || ! array_is_list($value)) {
            throw new InvalidArgumentException("\"{$what}\" must be an array.");
        }

        return $value;
    }

    /** An image value: blank, or a site-root path to a file that exists (/uploads/… or /images/…). */
    private static function image(mixed $value, bool $required = false): string
    {
        $value = trim((string) $value);
        if ($value === '') {
            if ($required) {
                throw new InvalidArgumentException('An image path is required.');
            }

            return '';
        }
        if (! preg_match('#^/?(uploads|images)/[A-Za-z0-9._/-]+$#', $value) || str_contains($value, '..')) {
            throw new InvalidArgumentException("Images must be site paths like /uploads/<file>.jpg (upload first). Got: {$value}");
        }
        $value = '/'.ltrim($value, '/');
        if (! is_file(public_path(ltrim($value, '/')))) {
            throw new InvalidArgumentException("No such file on the site: {$value}");
        }

        return $value;
    }
}
