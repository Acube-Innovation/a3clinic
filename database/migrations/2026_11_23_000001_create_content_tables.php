<?php

use App\Support\ContentTables;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Content tables, mirroring src/lib/admin/db/schema.ts in the Next.js app
 * column for column so a data-only dump from the live site imports unchanged.
 *
 * `sections` marks a section as "initialized" (written at least once). Until
 * then the site renders that section's in-code defaults (database/defaults).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sections', function (Blueprint $table) {
            $table->string('name', 64)->primary();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        // ---------------------------------------------------------------- conditions
        Schema::create('conditions', function (Blueprint $table) {
            $table->string('slug', 191)->primary();
            $table->text('name');
            $table->string('category', 32);
            $table->boolean('featured')->default(false);
            $table->text('summary')->nullable();
            $table->mediumText('intro')->nullable();
            $table->string('hero_image')->nullable();
            $table->string('intro_image')->nullable();
            $table->integer('position')->default(0);
        });
        $this->childOf('condition_symptoms', 'conditions', 'condition_slug', fn (Blueprint $t) => $t->text('text')->nullable());
        $this->childOf('condition_causes', 'conditions', 'condition_slug', fn (Blueprint $t) => $t->text('text')->nullable());
        $this->childOf('condition_treatment', 'conditions', 'condition_slug', fn (Blueprint $t) => $t->text('text')->nullable());
        $this->childOf('condition_expected_results', 'conditions', 'condition_slug', function (Blueprint $t) {
            $t->text('phase')->nullable();
            $t->text('detail')->nullable();
        });
        $this->childOf('condition_faqs', 'conditions', 'condition_slug', function (Blueprint $t) {
            $t->text('question')->nullable();
            $t->text('answer')->nullable();
        });
        $this->childOf('condition_results', 'conditions', 'condition_slug', function (Blueprint $t) {
            $t->string('before_image')->nullable();
            $t->string('after_image')->nullable();
            $t->text('label')->nullable();
            $t->text('note')->nullable();
        });

        // ------------------------------------------------------------------ products
        Schema::create('products', function (Blueprint $table) {
            $table->string('slug', 191)->primary();
            $table->text('name');
            $table->string('category', 32);
            $table->string('image')->nullable();
            $table->text('tagline')->nullable();
            $table->mediumText('description')->nullable();
            $table->integer('price')->default(0);
            $table->integer('compare_at_price')->nullable();
            $table->string('size', 191)->nullable();
            $table->boolean('in_stock')->default(true);
            $table->boolean('featured')->default(false);
            $table->boolean('bestseller')->default(false);
            $table->text('caution')->nullable();
            $table->float('rating_value')->default(0);
            $table->integer('rating_count')->default(0);
            $table->integer('position')->default(0);
        });
        $this->childOf('product_benefits', 'products', 'product_slug', fn (Blueprint $t) => $t->text('text')->nullable());
        $this->childOf('product_directions', 'products', 'product_slug', fn (Blueprint $t) => $t->text('text')->nullable());
        $this->childOf('product_related', 'products', 'product_slug', fn (Blueprint $t) => $t->string('related_slug', 191)->nullable());
        $this->childOf('product_ingredients', 'products', 'product_slug', function (Blueprint $t) {
            $t->text('name')->nullable();
            $t->text('role')->nullable();
        });
        $this->childOf('product_reviews', 'products', 'product_slug', function (Blueprint $t) {
            $t->text('author')->nullable();
            $t->text('location')->nullable();
            $t->integer('rating')->nullable();
            $t->string('date', 32)->nullable();
            $t->text('title')->nullable();
            $t->text('body')->nullable();
        });

        // --------------------------------------------------------------------- posts
        Schema::create('posts', function (Blueprint $table) {
            $table->string('slug', 191)->primary();
            $table->text('title');
            $table->string('category', 32);
            $table->string('image')->nullable();
            $table->text('excerpt')->nullable();
            $table->string('published_at', 32)->nullable();
            $table->integer('reading_minutes')->default(0);
            $table->boolean('featured')->default(false);
            $table->integer('position')->default(0);
        });
        $this->childOf('post_blocks', 'posts', 'post_slug', function (Blueprint $t) {
            $t->string('type', 16);
            $t->mediumText('text')->nullable();
        });
        Schema::create('post_block_items', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('block_id')->index();
            $table->integer('position')->default(0);
            $table->text('text')->nullable();
            $table->foreign('block_id')->references('id')->on('post_blocks')->cascadeOnDelete();
        });

        // ---------------------------------------------- flat lists and singletons
        // Testimonial identity is inconsistent in the source data: seed records
        // carry `id` (t1, t2…), admin-created ones `slug`. Both kept, nullable.
        Schema::create('testimonials', function (Blueprint $table) {
            $table->increments('id');
            $table->string('rec_id', 191)->nullable();
            $table->string('slug', 191)->nullable();
            $table->text('author')->nullable();
            $table->text('location')->nullable();
            $table->text('quote')->nullable();
            $table->text('context')->nullable();
            $table->boolean('consent_on_file')->default(false);
            $table->integer('position')->default(0);
        });
        $this->list('homepage_faqs', function (Blueprint $t) {
            $t->text('question')->nullable();
            $t->text('answer')->nullable();
        });
        $this->list('gallery_items', function (Blueprint $t) {
            $t->string('image')->nullable();
            $t->text('label')->nullable();
        });

        Schema::create('doctor', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->mediumText('bio_intro')->nullable();
            $table->text('mission')->nullable();
            $table->text('vision')->nullable();
        });
        $this->list('doctor_bio_paragraphs', fn (Blueprint $t) => $t->mediumText('text')->nullable());
        $this->list('doctor_values', function (Blueprint $t) {
            $t->text('title')->nullable();
            $t->text('detail')->nullable();
        });
        $this->list('doctor_education', function (Blueprint $t) {
            $t->string('year', 16)->nullable();
            $t->text('qualification')->nullable();
            $t->text('institution')->nullable();
            $t->text('detail')->nullable();
        });
        $this->list('doctor_timeline', function (Blueprint $t) {
            $t->string('year', 16)->nullable();
            $t->text('title')->nullable();
            $t->text('detail')->nullable();
        });
        $this->list('doctor_achievements', function (Blueprint $t) {
            $t->text('title')->nullable();
            $t->text('detail')->nullable();
        });
        $this->list('doctor_gallery', function (Blueprint $t) {
            $t->text('slot')->nullable();
            $t->text('label')->nullable();
        });

        Schema::create('clinic', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->string('phone', 32)->nullable();
            $table->string('whatsapp', 32)->nullable();
            $table->string('email', 191)->nullable();
            $table->text('address_line1')->nullable();
            $table->text('address_line2')->nullable();
            $table->string('city', 191)->nullable();
            $table->string('district', 191)->nullable();
            $table->string('state', 191)->nullable();
            $table->string('postal_code', 32)->nullable();
            $table->text('map_query')->nullable();
        });
        $this->list('clinic_hours', function (Blueprint $t) {
            $t->string('days', 191)->nullable();
            $t->string('time', 191)->nullable();
        });
        $this->list('clinic_stats', function (Blueprint $t) {
            $t->integer('value')->nullable();
            $t->string('suffix', 16)->nullable();
            $t->text('label')->nullable();
        });

        Schema::create('consultation', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->mediumText('delivery_note')->nullable();
        });
        $this->list('consultation_prepare', function (Blueprint $t) {
            $t->text('title')->nullable();
            $t->text('detail')->nullable();
        });

        // ------------------------------------------------------------------- inboxes
        // created_at is the ISO string the old app stored, not a Laravel timestamp.
        Schema::create('appointments', function (Blueprint $table) {
            $table->string('id', 32)->primary();
            $table->string('created_at', 32)->nullable();
            $table->string('status', 16)->nullable();
            $table->string('mode', 16)->nullable();
            $table->string('concern', 64)->nullable();
            $table->string('date', 16)->nullable();
            $table->string('time', 16)->nullable();
            $table->text('name')->nullable();
            $table->string('phone', 32)->nullable();
            $table->string('email', 191)->nullable();
            $table->string('age', 16)->nullable();
            $table->string('gender', 16)->nullable();
            $table->text('notes')->nullable();
            $table->integer('position')->default(0);
        });
        Schema::create('appointment_files', function (Blueprint $table) {
            $table->increments('id');
            $table->string('appointment_id', 32)->index();
            $table->integer('position')->default(0);
            $table->string('filename')->nullable();
            $table->foreign('appointment_id')->references('id')->on('appointments')->cascadeOnDelete();
        });
        Schema::create('enquiries', function (Blueprint $table) {
            $table->string('id', 32)->primary();
            $table->string('created_at', 32)->nullable();
            $table->boolean('read')->default(false);
            $table->text('name')->nullable();
            $table->string('phone', 32)->nullable();
            $table->string('email', 191)->nullable();
            $table->string('reason', 64)->nullable();
            $table->mediumText('message')->nullable();
            $table->integer('position')->default(0);
        });
    }

    public function down(): void
    {
        foreach (array_reverse(ContentTables::ALL) as $table) {
            Schema::dropIfExists($table);
        }
    }

    /** A child list of a slug-keyed parent, cascading on delete. */
    private function childOf(string $table, string $parent, string $fk, Closure $columns): void
    {
        Schema::create($table, function (Blueprint $t) use ($parent, $fk, $columns) {
            $t->increments('id');
            $t->string($fk, 191)->index();
            $t->integer('position')->default(0);
            $columns($t);
            $t->foreign($fk)->references('slug')->on($parent)->cascadeOnDelete();
        });
    }

    /** An ordered list belonging to a singleton (no FK; replaced wholesale). */
    private function list(string $table, Closure $columns): void
    {
        Schema::create($table, function (Blueprint $t) use ($columns) {
            $t->increments('id');
            $t->integer('position')->default(0);
            $columns($t);
        });
    }
};
