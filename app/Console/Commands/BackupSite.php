<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;

/**
 * Database dump (and, with --uploads, an archive of public/uploads) into
 * ~/backups beside the app, pruning old copies. Scheduled in routes/console.php.
 */
class BackupSite extends Command
{
    protected $signature = 'site:backup {--uploads : Also archive the uploaded images} {--keep=14 : Database dumps to keep}';

    protected $description = 'Back up the database (and optionally uploads) to ~/backups';

    public function handle(): int
    {
        $dir = config('app.backup_path');
        File::ensureDirectoryExists($dir, 0700);
        $stamp = now()->format('Y-m-d-His');

        $db = config('database.connections.'.config('database.default'));
        // Credentials go in a private options file, never on the command line.
        $options = tempnam(sys_get_temp_dir(), 'my');
        file_put_contents($options, "[client]\nuser=\"{$db['username']}\"\npassword=\"{$db['password']}\"\nhost=\"{$db['host']}\"\nport=\"{$db['port']}\"\n");
        chmod($options, 0600);

        try {
            $dump = "{$dir}/db-{$stamp}.sql.gz";
            $process = Process::fromShellCommandline(
                'mysqldump --defaults-extra-file="$OPTS" --single-transaction --routines --no-tablespaces "$DB" | gzip > "$OUT"',
                null, ['OPTS' => $options, 'DB' => $db['database'], 'OUT' => $dump], null, 600,
            );
            $process->run();
            if (! $process->isSuccessful() || filesize($dump) < 1000) {
                $this->error('Database dump failed: '.$process->getErrorOutput());

                return self::FAILURE;
            }
            chmod($dump, 0600);
            $this->info('Database: '.basename($dump).' ('.round(filesize($dump) / 1024).' KB)');
        } finally {
            @unlink($options);
        }

        if ($this->option('uploads')) {
            $archive = "{$dir}/uploads-{$stamp}.tar.gz";
            $process = new Process(['tar', '-czf', $archive, '-C', public_path(), 'uploads'], null, null, null, 900);
            $process->run();
            if (! $process->isSuccessful()) {
                $this->error('Uploads archive failed: '.$process->getErrorOutput());

                return self::FAILURE;
            }
            $this->info('Uploads: '.basename($archive).' ('.round(filesize($archive) / 1048576, 1).' MB)');
        }

        $this->prune($dir, 'db-*.sql.gz', (int) $this->option('keep'));
        $this->prune($dir, 'uploads-*.tar.gz', 4);

        return self::SUCCESS;
    }

    private function prune(string $dir, string $pattern, int $keep): void
    {
        $files = glob("{$dir}/{$pattern}");
        rsort($files);
        foreach (array_slice($files, $keep) as $old) {
            unlink($old);
        }
    }
}
