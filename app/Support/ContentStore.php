<?php

namespace App\Support;

use App\Models\Appointment;
use App\Models\AppointmentFile;
use App\Models\Clinic;
use App\Models\Condition;
use App\Models\Consultation;
use App\Models\Doctor;
use App\Models\Enquiry;
use App\Models\GalleryItem;
use App\Models\HomepageFaq;
use App\Models\Lists;
use App\Models\Post;
use App\Models\PostBlock;
use App\Models\Product;
use App\Models\Section;
use App\Models\Testimonial;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

/**
 * Section-shaped access to the content tables: a PHP port of
 * src/lib/admin/db/repositories.ts + store.ts from the Next.js app.
 *
 * read() returns each section in exactly the JSON shape the React components
 * consume (camelCase keys, nested lists). A section that has never been saved
 * (no `sections` row) returns its in-code defaults from database/defaults.
 */
class ContentStore
{
    public const SECTIONS = [
        'conditions', 'products', 'posts', 'testimonials', 'faqs',
        'doctor', 'clinic', 'consultation', 'gallery', 'appointments', 'enquiries',
    ];

    public function read(string $section): mixed
    {
        $this->assertSection($section);

        if (! Section::isInitialized($section)) {
            return $this->defaults($section);
        }

        return $this->{'read'.ucfirst($section)}();
    }

    public function write(string $section, array $data): void
    {
        $this->assertSection($section);

        DB::transaction(function () use ($section, $data) {
            $this->{'write'.ucfirst($section)}($data);
            Section::markInitialized($section);
        });
    }

    // ------------------------------------------- single records (admin editing)

    /** Slug-keyed collections the admin edits one record at a time. */
    private const RECORDS = [
        'conditions' => [Condition::class, 'saveCondition'],
        'products' => [Product::class, 'saveProduct'],
        'posts' => [Post::class, 'savePost'],
    ];

    /**
     * Fields a saved record always carries even when the admin form doesn't
     * edit them (blankFor + extraBlanks in the old actions.ts), so pages that
     * map over list fields never meet a missing key.
     */
    private const BLANKS = [
        'conditions' => ['symptoms' => [], 'causes' => [], 'treatment' => [], 'expectedResults' => [], 'faqs' => [], 'results' => []],
        'products' => ['benefits' => [], 'ingredients' => [], 'directions' => [], 'rating' => ['value' => 0, 'count' => 0], 'reviews' => [], 'related' => []],
        'posts' => ['readingMinutes' => 3, 'body' => []],
    ];

    /** One record of a collection, in its section shape. */
    public function record(string $section, string $slug): ?array
    {
        return collect($this->read($section))->firstWhere('slug', $slug);
    }

    /**
     * Save an edited record: the stored record merged with the submitted
     * fields, so values outside the form (ratings, reviews…) survive.
     */
    public function saveRecord(string $section, string $slug, array $data): void
    {
        [$model, $save] = self::RECORDS[$section] ?? throw new InvalidArgumentException("Not a record collection: {$section}");

        DB::transaction(function () use ($section, $slug, $data, $model, $save) {
            $this->initializeFromDefaults($section);
            $current = $this->record($section, $slug) ?? throw new InvalidArgumentException('Record no longer exists.');
            $position = $model::whereKey($slug)->value('position') ?? 0;
            $this->{$save}([...self::BLANKS[$section], ...$current, ...$data, 'slug' => $slug], $position);
        });
    }

    /** Create a record at the top of its collection with a slug derived from $title; returns the slug. */
    public function createRecord(string $section, string $title, array $data): string
    {
        [$model, $save] = self::RECORDS[$section] ?? throw new InvalidArgumentException("Not a record collection: {$section}");

        return DB::transaction(function () use ($section, $title, $data, $model, $save) {
            $this->initializeFromDefaults($section);
            $base = Str::slug($title) ?: 'untitled';
            $slug = $base;
            for ($n = 2; $model::whereKey($slug)->exists(); $n++) {
                $slug = "{$base}-{$n}";
            }
            // Newest first, as the old admin prepended new records.
            $model::query()->increment('position');
            $this->{$save}([...self::BLANKS[$section], ...$data, 'slug' => $slug], 0);

            return $slug;
        });
    }

    /**
     * Record edits work on tables; a section still showing its in-code defaults
     * is written out first so the edit applies on top of what visitors see.
     */
    private function initializeFromDefaults(string $section): void
    {
        if (! Section::isInitialized($section)) {
            $this->write($section, $this->defaults($section));
        }
    }

    /** The in-code defaults exported from the Next.js app's src/data. */
    public function defaults(string $section): mixed
    {
        $file = database_path("defaults/{$section}.json");

        return is_file($file) ? json_decode(file_get_contents($file), true) : [];
    }

    private function assertSection(string $section): void
    {
        if (! in_array($section, self::SECTIONS, true)) {
            throw new InvalidArgumentException("Unknown content section: {$section}");
        }
    }

    // ------------------------------------------------------------------ helpers

    private static function str(mixed $v): string
    {
        return $v === null ? '' : (string) $v;
    }

    private static function arr(mixed $v): array
    {
        return is_array($v) ? array_values($v) : [];
    }

    /** Text column of each row, in order. */
    private static function texts(iterable $rows, string $column = 'text'): array
    {
        $out = [];
        foreach ($rows as $row) {
            $out[] = self::str($row->{$column});
        }

        return $out;
    }

    /**
     * Pick columns from each row as strings. $map lists column names, or
     * column => key pairs where the output key differs from the column.
     */
    private static function rows(iterable $rows, array $map): array
    {
        $map = collect($map)->mapWithKeys(fn ($key, $column) => [is_int($column) ? $key : $column => $key]);
        $out = [];
        foreach ($rows as $row) {
            $out[] = $map->map(fn ($key, $column) => self::str($row->{$column}))
                ->mapWithKeys(fn ($value, $column) => [$map[$column] => $value])
                ->all();
        }

        return $out;
    }

    /**
     * Replace every row of a list table, assigning position by array order
     * (replaceKeyed / replaceAll in the Next app).
     *
     * @param  class-string<Model>  $model
     */
    private static function replaceList(string $model, array $items, array $scope = []): void
    {
        $query = $model::query();
        foreach ($scope as $column => $value) {
            $query->where($column, $value);
        }
        $query->delete();

        foreach (array_values($items) as $i => $item) {
            $model::create([...$scope, 'position' => $i, ...$item]);
        }
    }

    /** Delete parents whose key isn't in $keep (children cascade). */
    private static function deleteMissing(string $model, array $keep): void
    {
        $model::query()->whereNotIn((new $model)->getKeyName(), $keep)->delete();
    }

    // ------------------------------------------------------------------- conditions

    private function readConditions(): array
    {
        return Condition::with(['symptoms', 'causes', 'treatment', 'expectedResults', 'faqs', 'results'])
            ->orderBy('position')->get()
            ->map(function (Condition $c) {
                $rec = [
                    'slug' => $c->slug,
                    'name' => self::str($c->name),
                    'category' => $c->category,
                    'featured' => $c->featured,
                    'summary' => self::str($c->summary),
                    'intro' => self::str($c->intro),
                    'symptoms' => self::texts($c->symptoms),
                    'causes' => self::texts($c->causes),
                    'treatment' => self::texts($c->treatment),
                    'expectedResults' => self::rows($c->expectedResults, ['phase', 'detail']),
                    'faqs' => self::rows($c->faqs, ['question', 'answer']),
                    'results' => self::rows($c->results, [
                        'before_image' => 'before', 'after_image' => 'after', 'label' => 'label', 'note' => 'note',
                    ]),
                ];
                if ($c->hero_image) {
                    $rec['heroImage'] = $c->hero_image;
                }
                if ($c->intro_image) {
                    $rec['introImage'] = $c->intro_image;
                }

                return $rec;
            })->all();
    }

    private function writeConditions(array $data): void
    {
        self::deleteMissing(Condition::class, array_map(fn ($c) => (string) $c['slug'], $data));

        foreach (array_values($data) as $i => $c) {
            $this->saveCondition($c, $i);
        }
    }

    private function saveCondition(array $c, int $i): void
    {
        $slug = (string) $c['slug'];
        Condition::updateOrCreate(['slug' => $slug], [
            'name' => self::str($c['name'] ?? null),
            'category' => $c['category'],
            'featured' => (bool) ($c['featured'] ?? false),
            'summary' => self::str($c['summary'] ?? null),
            'intro' => self::str($c['intro'] ?? null),
            'hero_image' => $c['heroImage'] ?? null,
            'intro_image' => $c['introImage'] ?? null,
            'position' => $i,
        ]);
        $scope = ['condition_slug' => $slug];
        self::replaceList(Lists\ConditionSymptom::class, array_map(fn ($t) => ['text' => $t], self::arr($c['symptoms'] ?? null)), $scope);
        self::replaceList(Lists\ConditionCause::class, array_map(fn ($t) => ['text' => $t], self::arr($c['causes'] ?? null)), $scope);
        self::replaceList(Lists\ConditionTreatment::class, array_map(fn ($t) => ['text' => $t], self::arr($c['treatment'] ?? null)), $scope);
        self::replaceList(Lists\ConditionExpectedResult::class, array_map(fn ($e) => [
            'phase' => self::str($e['phase'] ?? null), 'detail' => self::str($e['detail'] ?? null),
        ], self::arr($c['expectedResults'] ?? null)), $scope);
        self::replaceList(Lists\ConditionFaq::class, array_map(fn ($f) => [
            'question' => self::str($f['question'] ?? null), 'answer' => self::str($f['answer'] ?? null),
        ], self::arr($c['faqs'] ?? null)), $scope);
        self::replaceList(Lists\ConditionResult::class, array_map(fn ($r) => [
            'before_image' => self::str($r['before'] ?? null),
            'after_image' => self::str($r['after'] ?? null),
            'label' => self::str($r['label'] ?? null),
            'note' => self::str($r['note'] ?? null),
        ], self::arr($c['results'] ?? null)), $scope);
    }

    // --------------------------------------------------------------------- products

    private function readProducts(): array
    {
        return Product::with(['benefits', 'ingredients', 'directions', 'reviews', 'related'])
            ->orderBy('position')->get()
            ->map(function (Product $p) {
                $rec = [
                    'slug' => $p->slug,
                    'name' => self::str($p->name),
                    'category' => $p->category,
                    'tagline' => self::str($p->tagline),
                    'description' => self::str($p->description),
                    'price' => $p->price,
                    'size' => self::str($p->size),
                    'inStock' => $p->in_stock,
                    'benefits' => self::texts($p->benefits),
                    'ingredients' => self::rows($p->ingredients, ['name', 'role']),
                    'directions' => self::texts($p->directions),
                    'caution' => self::str($p->caution),
                    'rating' => ['value' => $p->rating_value, 'count' => $p->rating_count],
                    'reviews' => $p->reviews->map(fn ($r) => [
                        'author' => self::str($r->author),
                        'location' => self::str($r->location),
                        'rating' => (int) $r->rating,
                        'date' => self::str($r->date),
                        'title' => self::str($r->title),
                        'body' => self::str($r->body),
                    ])->all(),
                    'related' => self::texts($p->related, 'related_slug'),
                ];
                if ($p->image) {
                    $rec['image'] = $p->image;
                }
                if ($p->compare_at_price !== null) {
                    $rec['compareAtPrice'] = $p->compare_at_price;
                }
                if ($p->featured) {
                    $rec['featured'] = true;
                }
                if ($p->bestseller) {
                    $rec['bestseller'] = true;
                }

                return $rec;
            })->all();
    }

    private function writeProducts(array $data): void
    {
        self::deleteMissing(Product::class, array_map(fn ($p) => (string) $p['slug'], $data));

        foreach (array_values($data) as $i => $p) {
            $this->saveProduct($p, $i);
        }
    }

    private function saveProduct(array $p, int $i): void
    {
        $slug = (string) $p['slug'];
        $rating = $p['rating'] ?? [];
        Product::updateOrCreate(['slug' => $slug], [
            'name' => self::str($p['name'] ?? null),
            'category' => $p['category'],
            'image' => $p['image'] ?? null,
            'tagline' => self::str($p['tagline'] ?? null),
            'description' => self::str($p['description'] ?? null),
            'price' => (int) ($p['price'] ?? 0),
            'compare_at_price' => $p['compareAtPrice'] ?? null,
            'size' => self::str($p['size'] ?? null),
            'in_stock' => (bool) ($p['inStock'] ?? false),
            'featured' => (bool) ($p['featured'] ?? false),
            'bestseller' => (bool) ($p['bestseller'] ?? false),
            'caution' => self::str($p['caution'] ?? null),
            'rating_value' => (float) ($rating['value'] ?? 0),
            'rating_count' => (int) ($rating['count'] ?? 0),
            'position' => $i,
        ]);
        $scope = ['product_slug' => $slug];
        self::replaceList(Lists\ProductBenefit::class, array_map(fn ($t) => ['text' => $t], self::arr($p['benefits'] ?? null)), $scope);
        self::replaceList(Lists\ProductDirection::class, array_map(fn ($t) => ['text' => $t], self::arr($p['directions'] ?? null)), $scope);
        self::replaceList(Lists\ProductRelated::class, array_map(fn ($s) => ['related_slug' => $s], self::arr($p['related'] ?? null)), $scope);
        self::replaceList(Lists\ProductIngredient::class, array_map(fn ($g) => [
            'name' => self::str($g['name'] ?? null), 'role' => self::str($g['role'] ?? null),
        ], self::arr($p['ingredients'] ?? null)), $scope);
        self::replaceList(Lists\ProductReview::class, array_map(fn ($r) => [
            'author' => self::str($r['author'] ?? null),
            'location' => self::str($r['location'] ?? null),
            'rating' => (int) ($r['rating'] ?? 0),
            'date' => self::str($r['date'] ?? null),
            'title' => self::str($r['title'] ?? null),
            'body' => self::str($r['body'] ?? null),
        ], self::arr($p['reviews'] ?? null)), $scope);
    }

    // ------------------------------------------------------------------------ posts

    private function readPosts(): array
    {
        return Post::with('blocks.items')->orderBy('position')->get()
            ->map(function (Post $p) {
                $rec = [
                    'slug' => $p->slug,
                    'title' => self::str($p->title),
                    'category' => $p->category,
                    'excerpt' => self::str($p->excerpt),
                    'publishedAt' => self::str($p->published_at),
                    'readingMinutes' => $p->reading_minutes,
                    'body' => $p->blocks->map(fn (PostBlock $b) => $b->type === 'list'
                        ? ['type' => 'list', 'items' => self::texts($b->items)]
                        : ['type' => $b->type, 'text' => self::str($b->text)]
                    )->all(),
                ];
                if ($p->image) {
                    $rec['image'] = $p->image;
                }
                if ($p->featured) {
                    $rec['featured'] = true;
                }

                return $rec;
            })->all();
    }

    private function writePosts(array $data): void
    {
        self::deleteMissing(Post::class, array_map(fn ($p) => (string) $p['slug'], $data));

        foreach (array_values($data) as $i => $p) {
            $this->savePost($p, $i);
        }
    }

    private function savePost(array $p, int $i): void
    {
        $slug = (string) $p['slug'];
        Post::updateOrCreate(['slug' => $slug], [
            'title' => self::str($p['title'] ?? null),
            'category' => $p['category'],
            'image' => $p['image'] ?? null,
            'excerpt' => self::str($p['excerpt'] ?? null),
            'published_at' => self::str($p['publishedAt'] ?? null),
            'reading_minutes' => (int) ($p['readingMinutes'] ?? 0),
            'featured' => (bool) ($p['featured'] ?? false),
            'position' => $i,
        ]);

        // Rebuild blocks; their items cascade-delete with them.
        PostBlock::where('post_slug', $slug)->delete();
        foreach (self::arr($p['body'] ?? null) as $j => $b) {
            $isList = ($b['type'] ?? null) === 'list';
            $block = PostBlock::create([
                'post_slug' => $slug,
                'position' => $j,
                'type' => (string) $b['type'],
                'text' => $isList ? null : self::str($b['text'] ?? null),
            ]);
            if ($isList) {
                foreach (self::arr($b['items'] ?? null) as $k => $text) {
                    $block->items()->create(['position' => $k, 'text' => $text]);
                }
            }
        }
    }

    // ----------------------------------------------------------------- testimonials

    private function readTestimonials(): array
    {
        return Testimonial::orderBy('position')->get()->map(function (Testimonial $t) {
            $rec = [
                'author' => self::str($t->author),
                'location' => self::str($t->location),
                'quote' => self::str($t->quote),
                'context' => self::str($t->context),
                'consentOnFile' => $t->consent_on_file,
            ];
            // Preserve whichever identity the record originally carried.
            if ($t->rec_id !== null) {
                $rec['id'] = $t->rec_id;
            }
            if ($t->slug !== null) {
                $rec['slug'] = $t->slug;
            }

            return $rec;
        })->all();
    }

    private function writeTestimonials(array $data): void
    {
        self::replaceList(Testimonial::class, array_map(fn ($t) => [
            'rec_id' => $t['id'] ?? null,
            'slug' => $t['slug'] ?? null,
            'author' => self::str($t['author'] ?? null),
            'location' => self::str($t['location'] ?? null),
            'quote' => self::str($t['quote'] ?? null),
            'context' => self::str($t['context'] ?? null),
            'consent_on_file' => (bool) ($t['consentOnFile'] ?? false),
        ], $data));
    }

    // --------------------------------------------------------------- faqs, gallery

    private function readFaqs(): array
    {
        return self::rows(HomepageFaq::orderBy('position')->get(), ['question', 'answer']);
    }

    private function writeFaqs(array $data): void
    {
        self::replaceList(HomepageFaq::class, array_map(fn ($f) => [
            'question' => self::str($f['question'] ?? null), 'answer' => self::str($f['answer'] ?? null),
        ], $data));
    }

    private function readGallery(): array
    {
        return self::rows(GalleryItem::orderBy('position')->get(), ['image', 'label']);
    }

    private function writeGallery(array $data): void
    {
        self::replaceList(GalleryItem::class, array_map(fn ($g) => [
            'image' => self::str($g['image'] ?? null), 'label' => self::str($g['label'] ?? null),
        ], $data));
    }

    // ----------------------------------------------------------------------- doctor

    private function readDoctor(): array
    {
        $d = Doctor::current();

        return [
            'biography' => [
                'intro' => self::str($d?->bio_intro),
                'paragraphs' => self::texts(Lists\DoctorBioParagraph::orderBy('position')->get()),
            ],
            'education' => self::rows(Lists\DoctorEducation::orderBy('position')->get(), ['year', 'qualification', 'institution', 'detail']),
            'timeline' => self::rows(Lists\DoctorTimeline::orderBy('position')->get(), ['year', 'title', 'detail']),
            'achievements' => self::rows(Lists\DoctorAchievement::orderBy('position')->get(), ['title', 'detail']),
            'mission' => [
                'mission' => self::str($d?->mission),
                'vision' => self::str($d?->vision),
                'values' => self::rows(Lists\DoctorValue::orderBy('position')->get(), ['title', 'detail']),
            ],
            'gallery' => self::rows(Lists\DoctorGallery::orderBy('position')->get(), ['slot', 'label']),
        ];
    }

    private function writeDoctor(array $data): void
    {
        $bio = $data['biography'] ?? [];
        $mission = $data['mission'] ?? [];
        Doctor::updateOrCreate(['id' => 1], [
            'bio_intro' => self::str($bio['intro'] ?? null),
            'mission' => self::str($mission['mission'] ?? null),
            'vision' => self::str($mission['vision'] ?? null),
        ]);
        $pick = fn (array $keys) => fn ($row) => array_combine($keys, array_map(fn ($k) => self::str($row[$k] ?? null), $keys));
        self::replaceList(Lists\DoctorBioParagraph::class, array_map(fn ($t) => ['text' => $t], self::arr($bio['paragraphs'] ?? null)));
        self::replaceList(Lists\DoctorValue::class, array_map($pick(['title', 'detail']), self::arr($mission['values'] ?? null)));
        self::replaceList(Lists\DoctorEducation::class, array_map($pick(['year', 'qualification', 'institution', 'detail']), self::arr($data['education'] ?? null)));
        self::replaceList(Lists\DoctorTimeline::class, array_map($pick(['year', 'title', 'detail']), self::arr($data['timeline'] ?? null)));
        self::replaceList(Lists\DoctorAchievement::class, array_map($pick(['title', 'detail']), self::arr($data['achievements'] ?? null)));
        self::replaceList(Lists\DoctorGallery::class, array_map($pick(['slot', 'label']), self::arr($data['gallery'] ?? null)));
    }

    // ----------------------------------------------------------------------- clinic

    private const CLINIC_COLUMNS = [
        'phone' => 'phone', 'whatsapp' => 'whatsapp', 'email' => 'email',
        'address_line1' => 'addressLine1', 'address_line2' => 'addressLine2',
        'city' => 'city', 'district' => 'district', 'state' => 'state',
        'postal_code' => 'postalCode', 'map_query' => 'mapQuery',
    ];

    private function readClinic(): array
    {
        $c = Clinic::current();
        $rec = [];
        foreach (self::CLINIC_COLUMNS as $column => $key) {
            $rec[$key] = self::str($c?->{$column});
        }
        $rec['hours'] = self::rows(Lists\ClinicHour::orderBy('position')->get(), ['days', 'time']);
        $rec['stats'] = Lists\ClinicStat::orderBy('position')->get()->map(fn ($s) => [
            'value' => (int) $s->value,
            'suffix' => self::str($s->suffix),
            'label' => self::str($s->label),
        ])->all();

        return $rec;
    }

    private function writeClinic(array $data): void
    {
        $values = [];
        foreach (self::CLINIC_COLUMNS as $column => $key) {
            $values[$column] = self::str($data[$key] ?? null);
        }
        Clinic::updateOrCreate(['id' => 1], $values);
        self::replaceList(Lists\ClinicHour::class, array_map(fn ($h) => [
            'days' => self::str($h['days'] ?? null), 'time' => self::str($h['time'] ?? null),
        ], self::arr($data['hours'] ?? null)));
        self::replaceList(Lists\ClinicStat::class, array_map(fn ($s) => [
            'value' => (int) ($s['value'] ?? 0),
            'suffix' => self::str($s['suffix'] ?? null),
            'label' => self::str($s['label'] ?? null),
        ], self::arr($data['stats'] ?? null)));
    }

    // ----------------------------------------------------------------- consultation

    private function readConsultation(): array
    {
        return [
            'prepare' => self::rows(Lists\ConsultationPrepare::orderBy('position')->get(), ['title', 'detail']),
            'deliveryNote' => self::str(Consultation::current()?->delivery_note),
        ];
    }

    private function writeConsultation(array $data): void
    {
        Consultation::updateOrCreate(['id' => 1], ['delivery_note' => self::str($data['deliveryNote'] ?? null)]);
        self::replaceList(Lists\ConsultationPrepare::class, array_map(fn ($p) => [
            'title' => self::str($p['title'] ?? null), 'detail' => self::str($p['detail'] ?? null),
        ], self::arr($data['prepare'] ?? null)));
    }

    // ---------------------------------------------------------------------- inboxes

    private const APPOINTMENT_COLUMNS = [
        'created_at' => 'createdAt', 'concern' => 'concern', 'date' => 'date', 'time' => 'time',
        'name' => 'name', 'phone' => 'phone', 'email' => 'email', 'age' => 'age',
        'gender' => 'gender', 'notes' => 'notes',
    ];

    private function readAppointments(): array
    {
        return Appointment::with('files')->orderBy('position')->get()->map(fn (Appointment $a) => [
            'id' => $a->id,
            'createdAt' => self::str($a->created_at),
            'status' => $a->status,
            'mode' => $a->mode,
            'concern' => self::str($a->concern),
            'date' => self::str($a->date),
            'time' => self::str($a->time),
            'name' => self::str($a->name),
            'phone' => self::str($a->phone),
            'email' => self::str($a->email),
            'age' => self::str($a->age),
            'gender' => self::str($a->gender),
            'notes' => self::str($a->notes),
            'files' => self::texts($a->files, 'filename'),
        ])->all();
    }

    private function writeAppointments(array $data): void
    {
        self::deleteMissing(Appointment::class, array_map(fn ($a) => (string) $a['id'], $data));

        foreach (array_values($data) as $i => $a) {
            $id = (string) $a['id'];
            $values = ['status' => $a['status'] ?? null, 'mode' => $a['mode'] ?? null, 'position' => $i];
            foreach (self::APPOINTMENT_COLUMNS as $column => $key) {
                $values[$column] = self::str($a[$key] ?? null);
            }
            Appointment::updateOrCreate(['id' => $id], $values);
            self::replaceList(AppointmentFile::class,
                array_map(fn ($f) => ['filename' => $f], self::arr($a['files'] ?? null)),
                ['appointment_id' => $id]);
        }
    }

    private function readEnquiries(): array
    {
        return Enquiry::orderBy('position')->get()->map(fn (Enquiry $e) => [
            'id' => $e->id,
            'createdAt' => self::str($e->created_at),
            'read' => $e->read,
            'name' => self::str($e->name),
            'phone' => self::str($e->phone),
            'email' => self::str($e->email),
            'reason' => self::str($e->reason),
            'message' => self::str($e->message),
        ])->all();
    }

    private function writeEnquiries(array $data): void
    {
        self::deleteMissing(Enquiry::class, array_map(fn ($e) => (string) $e['id'], $data));

        foreach (array_values($data) as $i => $e) {
            Enquiry::updateOrCreate(['id' => (string) $e['id']], [
                'created_at' => self::str($e['createdAt'] ?? null),
                'read' => (bool) ($e['read'] ?? false),
                'name' => self::str($e['name'] ?? null),
                'phone' => self::str($e['phone'] ?? null),
                'email' => self::str($e['email'] ?? null),
                'reason' => self::str($e['reason'] ?? null),
                'message' => self::str($e['message'] ?? null),
                'position' => $i,
            ]);
        }
    }
}
