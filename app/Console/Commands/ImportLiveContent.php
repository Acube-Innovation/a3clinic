<?php

namespace App\Console\Commands;

use App\Models\AppointmentFile;
use App\Models\Section;
use App\Support\ContentTables;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Loads a data-only dump of the old Next.js site's database. Produce the dump
 * on the old server with:
 *
 *   mysqldump --no-create-info --complete-insert --skip-extended-insert \
 *     --skip-triggers --single-transaction --ignore-table=a3clinic.documents a3clinic
 *
 * By default it replaces all site content (initial import, final sync).
 * With --merge it only adds booking requests and enquiries this site doesn't
 * have yet, for catching submissions that reached the old server while DNS
 * moved, without losing ones that already reached this one.
 */
class ImportLiveContent extends Command
{
    protected $signature = 'content:import
        {file : Path to the data-only SQL dump}
        {--merge : Only add appointments and enquiries missing here}';

    protected $description = 'Load site content (or, with --merge, new inbox items) from a dump of the old site';

    public function handle(): int
    {
        $file = $this->argument('file');
        if (! is_readable($file)) {
            $this->error("Cannot read {$file}");

            return self::FAILURE;
        }

        return $this->option('merge') ? $this->merge($file) : $this->replace($file);
    }

    private function replace(string $file): int
    {
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

    private function merge(string $file): int
    {
        $lines = file($file, FILE_IGNORE_NEW_LINES);
        $existing = DB::table('appointments')->pluck('id')->flip();
        $added = ['appointments' => 0, 'enquiries' => 0, 'appointment_files' => 0];
        $newAppointments = [];
        $insertIgnore = DB::getDriverName() === 'sqlite' ? 'INSERT OR IGNORE INTO' : 'INSERT IGNORE INTO';

        DB::transaction(function () use ($lines, $existing, $insertIgnore, &$added, &$newAppointments) {
            foreach ($lines as $line) {
                // One row per statement (--skip-extended-insert); ids are strings, so IGNORE skips known ones.
                if (preg_match('/^INSERT INTO `(appointments|enquiries)` /', $line, $m)) {
                    $added[$m[1]] += DB::affectingStatement(preg_replace('/^INSERT INTO/', $insertIgnore, $line));
                    if ($m[1] === 'appointments' && preg_match("/VALUES \\('([^']+)'/", $line, $id) && ! $existing->has($id[1])) {
                        $newAppointments[$id[1]] = true;
                    }
                }
            }
            // Files carry auto-increment ids that may clash here: re-insert them
            // without the id, and only for appointments that were just added.
            foreach ($lines as $line) {
                if (preg_match("/^INSERT INTO `appointment_files` \\([^)]*\\) VALUES \\(\\d+,'([^']+)',(\\d+),'((?:[^'\\\\]|\\\\.)*)'\\);$/", $line, $m)
                    && isset($newAppointments[$m[1]])) {
                    AppointmentFile::create(['appointment_id' => $m[1], 'position' => (int) $m[2], 'filename' => stripcslashes($m[3])]);
                    $added['appointment_files']++;
                }
            }
            if ($added['appointments']) {
                Section::markInitialized('appointments');
            }
            if ($added['enquiries']) {
                Section::markInitialized('enquiries');
            }
        });

        $this->table(['Added', 'Rows'], collect($added)->map(fn ($n, $t) => [$t, $n])->values()->all());

        return self::SUCCESS;
    }
}
