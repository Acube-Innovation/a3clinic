<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Video support and the connector's change log.
 *
 * A video value is either a YouTube URL or a site-root path to an uploaded
 * file (/uploads/videos/<uuid>.mp4); see App\Support\VideoSource.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conditions', fn (Blueprint $t) => $t->string('video')->nullable()->after('intro_image'));
        Schema::table('products', fn (Blueprint $t) => $t->string('video')->nullable()->after('image'));

        // Home page video gallery: an ordered list, replaced wholesale.
        Schema::create('home_videos', function (Blueprint $t) {
            $t->increments('id');
            $t->integer('position')->default(0);
            $t->text('title')->nullable();
            $t->string('video')->nullable();
        });

        // Every content write made through the Claude connector, for undo.
        Schema::create('content_changes', function (Blueprint $t) {
            $t->id();
            $t->string('section', 64);
            $t->string('slug', 191)->nullable();
            $t->string('action', 32);
            $t->longText('before')->nullable();
            $t->longText('after')->nullable();
            $t->string('actor', 191)->nullable();
            $t->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_changes');
        Schema::dropIfExists('home_videos');
        Schema::table('products', fn (Blueprint $t) => $t->dropColumn('video'));
        Schema::table('conditions', fn (Blueprint $t) => $t->dropColumn('video'));
    }
};
