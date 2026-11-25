<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One-time upload pages for the Claude connector: Claude (e.g. in claude.ai,
 * which can't pass attached files on) hands out a signed link; the person
 * uploads photos/videos there, and Claude reads back the stored paths.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('upload_links', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->boolean('watermark')->default(false);
            $t->string('purpose')->nullable();
            $t->json('files')->nullable();
            $t->timestamp('expires_at');
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('upload_links');
    }
};
