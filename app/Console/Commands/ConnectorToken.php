<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

/**
 * Access tokens for the Claude connector (/mcp and /api/media).
 *
 *   php artisan connector:token ratheesh          create a token (shown once)
 *   php artisan connector:token ratheesh --revoke revoke every token with that name
 *   php artisan connector:token --list            list tokens
 */
class ConnectorToken extends Command
{
    protected $signature = 'connector:token {name? : Who the token is for} {--revoke : Revoke tokens with this name} {--list : List tokens}';

    protected $description = 'Create, list or revoke Claude connector access tokens';

    public function handle(): int
    {
        $admin = User::orderBy('id')->first();
        if (! $admin) {
            $this->error('No admin user exists yet (run the seeders).');

            return self::FAILURE;
        }

        if ($this->option('list')) {
            $this->table(['Name', 'Created', 'Last used'], $admin->tokens()->orderBy('id')->get()
                ->map(fn ($t) => [$t->name, $t->created_at, $t->last_used_at ?? 'never'])->all());

            return self::SUCCESS;
        }

        $name = $this->argument('name') ?? $this->ask('Who is this token for?');

        if ($this->option('revoke')) {
            $count = $admin->tokens()->where('name', $name)->delete();
            $this->info("Revoked {$count} token(s) named \"{$name}\".");

            return self::SUCCESS;
        }

        $token = $admin->createToken($name, ['connector'])->plainTextToken;
        $this->info("Connector token for \"{$name}\" (shown only once):");
        $this->line($token);

        return self::SUCCESS;
    }
}
