<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * The clinic's admin login, carried over from the old site's ADMIN_EMAIL /
 * ADMIN_PASSWORD settings. Creates the account once; a password changed later
 * in the panel is never overwritten.
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = config('app.admin.email');
        $password = config('app.admin.password');
        if (! $email || ! $password) {
            $this->command?->warn('ADMIN_EMAIL / ADMIN_PASSWORD not set — no admin user created.');

            return;
        }

        User::firstOrCreate(['email' => $email], ['name' => 'Clinic admin', 'password' => $password]);
    }
}
