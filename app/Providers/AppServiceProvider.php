<?php

namespace App\Providers;

use App\Support\MediaStore;
use App\Support\SiteData;
use Illuminate\Support\ServiceProvider;

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
    }
}
