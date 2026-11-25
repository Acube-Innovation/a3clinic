<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Laravel\Passport\ClientRepository;
use Laravel\Passport\Token;
use RuntimeException;

/**
 * Personal access tokens for the Claude connector in Claude Code (/mcp and
 * /api/media). claude.ai apps don't need one: they sign in with OAuth.
 *
 *   php artisan connector:token ratheesh          create a token (shown once)
 *   php artisan connector:token ratheesh --revoke revoke every token with that name
 *   php artisan connector:token --list            list tokens and OAuth connections
 */
class ConnectorToken extends Command
{
    protected $signature = 'connector:token {name? : Who the token is for} {--revoke : Revoke tokens with this name} {--list : List tokens}';

    protected $description = 'Create, list or revoke Claude connector access tokens';

    public function handle(ClientRepository $clients): int
    {
        $admin = User::orderBy('id')->first();
        if (! $admin) {
            $this->error('No admin user exists yet (run the seeders).');

            return self::FAILURE;
        }

        if ($this->option('list')) {
            $this->table(['Name / app', 'User', 'Created', 'Expires', 'Revoked'], Token::with('client')->latest()->get()
                ->map(fn (Token $t) => [
                    $t->name ?: ($t->client?->name.' (OAuth)'),
                    User::find($t->user_id)?->email,
                    $t->created_at,
                    $t->expires_at,
                    $t->revoked ? 'yes' : 'no',
                ])->all());

            return self::SUCCESS;
        }

        $name = $this->argument('name') ?? $this->ask('Who is this token for?');

        if ($this->option('revoke')) {
            $count = Token::where('name', $name)->where('revoked', false)->update(['revoked' => true]);
            $this->info("Revoked {$count} token(s) named \"{$name}\".");

            return self::SUCCESS;
        }

        try {
            $clients->personalAccessClient('users');
        } catch (RuntimeException) {
            $clients->createPersonalAccessGrantClient('Claude connector tokens', 'users');
        }

        $token = $admin->createToken($name, ['mcp:use'])->accessToken;
        $this->info("Connector token for \"{$name}\" (shown only once):");
        $this->line($token);

        return self::SUCCESS;
    }
}
