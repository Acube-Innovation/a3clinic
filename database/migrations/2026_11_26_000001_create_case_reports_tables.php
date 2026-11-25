<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Case reports: anonymised, consented patient cases with a photo timeline,
 * shown at /results and on each condition page (App\Support\ContentStore
 * section "cases").
 *
 * Existing condition before/after pairs become unpublished draft cases, so
 * the clinic reviews each one (consent, wording) before it goes back online.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('case_reports', function (Blueprint $t) {
            $t->string('slug', 191)->primary();
            $t->string('code', 64);
            $t->text('title');
            $t->string('condition_slug', 191)->nullable();
            $t->string('sex', 16)->nullable();
            $t->string('age_band', 32)->nullable();
            $t->string('complaint_duration', 64)->nullable();
            $t->string('follow_up', 64)->nullable();
            $t->text('summary')->nullable();
            $t->mediumText('presentation')->nullable();
            $t->mediumText('history')->nullable();
            $t->mediumText('assessment')->nullable();
            $t->text('remedies')->nullable();
            $t->mediumText('outcome')->nullable();
            $t->text('doctor_note')->nullable();
            // Consent: the document path is on the private disk and never
            // leaves the admin.
            $t->boolean('consent_on_file')->default(false);
            $t->date('consent_date')->nullable();
            $t->string('consent_document')->nullable();
            $t->boolean('published')->default(false);
            $t->boolean('featured')->default(false);
            $t->boolean('sample')->default(false);
            $t->boolean('noindex')->default(false);
            $t->integer('position')->default(0);

            $t->foreign('condition_slug')->references('slug')->on('conditions')
                ->cascadeOnUpdate()->nullOnDelete();
        });

        Schema::create('case_report_approach', function (Blueprint $t) {
            $t->increments('id');
            $t->string('case_slug', 191);
            $t->integer('position')->default(0);
            $t->text('text')->nullable();
            $t->foreign('case_slug')->references('slug')->on('case_reports')->cascadeOnUpdate()->cascadeOnDelete();
        });

        Schema::create('case_report_stages', function (Blueprint $t) {
            $t->increments('id');
            $t->string('case_slug', 191);
            $t->integer('position')->default(0);
            $t->text('label')->nullable();
            $t->string('timepoint', 64)->nullable();
            $t->text('note')->nullable();
            // [{"view": "Front", "image": "/uploads/…"}]
            $t->text('photos')->nullable();
            $t->foreign('case_slug')->references('slug')->on('case_reports')->cascadeOnUpdate()->cascadeOnDelete();
        });

        $this->convertConditionPairs();
    }

    /** Each existing before/after pair becomes a two-stage draft case. */
    private function convertConditionPairs(): void
    {
        $pairs = DB::table('condition_results')
            ->join('conditions', 'conditions.slug', '=', 'condition_results.condition_slug')
            ->select('condition_results.*', 'conditions.name as condition_name')
            ->orderBy('condition_results.condition_slug')->orderBy('condition_results.position')
            ->get();

        foreach ($pairs as $i => $pair) {
            if (! $pair->before_image || ! $pair->after_image) {
                continue;
            }
            $code = 'CASE-'.str_pad((string) ($i + 1), 3, '0', STR_PAD_LEFT);
            $slug = Str::slug($code);
            DB::table('case_reports')->insert([
                'slug' => $slug,
                'code' => $code,
                'title' => $pair->label ?: $pair->condition_name,
                'condition_slug' => $pair->condition_slug,
                'summary' => $pair->note,
                'published' => false,
                'position' => $i,
            ]);
            foreach ([['Before', $pair->before_image], ['After', $pair->after_image]] as $j => [$label, $image]) {
                DB::table('case_report_stages')->insert([
                    'case_slug' => $slug,
                    'position' => $j,
                    'label' => $label,
                    'photos' => json_encode([['view' => 'Front', 'image' => $image]]),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('case_report_stages');
        Schema::dropIfExists('case_report_approach');
        Schema::dropIfExists('case_reports');
    }
};
