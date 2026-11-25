<?php

namespace App\Providers;

use App\Support\MediaStore;
use App\Support\SiteData;
use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Passport;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // One SiteData per request so each content section is read once.
        $this->app->scoped(SiteData::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Admin video uploads go through Livewire's temporary uploads (12 MB by
        // default); allow up to the host's 30 MB upload limit.
        config(['livewire.temporary_file_upload.rules' => ['required', 'file', 'max:'.(MediaStore::MAX_VIDEO_BYTES / 1024)]]);

        // Claude connector auth. claude.ai signs in with OAuth (short-lived
        // access tokens, refreshed for 90 days); Claude Code uses long-lived
        // personal tokens from `php artisan connector:token`.
        Passport::tokensExpireIn(now()->addDay());
        Passport::refreshTokensExpireIn(now()->addDays(90));
        Passport::personalAccessTokensExpireIn(now()->addYears(5));
        Passport::authorizationView('oauth.authorize');
    }
}
