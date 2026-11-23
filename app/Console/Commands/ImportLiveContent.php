<?php

namespace App\Console\Commands;

use App\Support\ContentTables;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Loads a data-only dump of the old Next.js site's database into the content
 * tables, replacing what is there. Used for the initial import and again for
 * the final sync at go-live. Produce the dump on the old server with:
 *
 *   mysqldump --no-create-info --complete-insert --skip-triggers \
 *     --single-transaction --ignore-table=a3clinic.documents a3clinic
 */
class ImportLiveContent extends Command
{
    protected $signature = 'content:import {file : Path to the data-only SQL dump}';

    protected $description = 'Replace all site content with a data-only dump from the old site';

    public function handle(): int
    {
        $file = $this->argument('file');
        if (! is_readable($file)) {
            $this->error("Cannot read {$file}");

            return self::FAILURE;
        }

        $sql = file_get_contents($file);
        // LOCK TABLES needs privileges shared hosting doesn't grant; the import
        // runs with FK checks off instead, so the locks add nothing.
        $sql = preg_replace('/^(UN)?LOCK TABLES.*$/m', '', $sql);

        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        try {
            foreach (ContentTables::ALL as $table) {
                DB::table($table)->truncate();
            }
            DB::unprepared($sql);
        } finally {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }

        $this->table(['Table', 'Rows'], collect(ContentTables::ALL)
            ->map(fn ($t) => [$t, DB::table($t)->count()])
            ->all());

        return self::SUCCESS;
    }
}
