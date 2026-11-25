<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\URL;

/** A one-time upload page handed out by the Claude connector. */
class UploadLink extends Model
{
    use HasUuids;

    public const LIFETIME_MINUTES = 30;

    public const MAX_FILES = 20;

    protected $guarded = [];

    protected $casts = ['watermark' => 'boolean', 'files' => 'array', 'expires_at' => 'datetime'];

    public function isOpen(): bool
    {
        return $this->expires_at->isFuture() && count($this->files ?? []) < self::MAX_FILES;
    }

    public function url(): string
    {
        return URL::temporarySignedRoute('upload-link.show', $this->expires_at, ['link' => $this->id]);
    }

    public function uploadUrl(): string
    {
        return URL::temporarySignedRoute('upload-link.store', $this->expires_at, ['link' => $this->id]);
    }

    /** Record a stored file (as returned by MediaStore::store) with its original name. */
    public function addFile(array $stored, string $originalName): void
    {
        $this->files = [...($this->files ?? []), [...$stored, 'name' => $originalName]];
        $this->save();
    }
}
