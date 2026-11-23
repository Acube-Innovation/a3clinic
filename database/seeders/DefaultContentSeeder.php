<?php

namespace Database\Seeders;

use App\Models\Section;
use App\Support\ContentStore;
use Illuminate\Database\Seeder;

/**
 * Writes the in-code defaults (database/defaults/*.json, exported from the
 * Next.js app's src/data) into every content section that has never been
 * saved. Sections that already hold content are left untouched, so this is
 * safe to run after importing the live site's data.
 */
class DefaultContentSeeder extends Seeder
{
    /** Inboxes start empty; they have no defaults to seed. */
    private const SKIP = ['appointments', 'enquiries'];

    public function run(ContentStore $store): void
    {
        foreach (array_diff(ContentStore::SECTIONS, self::SKIP) as $section) {
            if (Section::isInitialized($section)) {
                continue;
            }
            $store->write($section, $store->defaults($section));
            $this->command?->info("Seeded defaults: {$section}");
        }
    }
}
