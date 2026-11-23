<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Marks a content section as initialized (saved at least once). Sections
 * without a row fall back to the in-code defaults in database/defaults.
 */
class Section extends Model
{
    public const CREATED_AT = null;

    public $incrementing = false;

    protected $primaryKey = 'name';

    protected $keyType = 'string';

    protected $guarded = [];

    public static function isInitialized(string $name): bool
    {
        return static::whereKey($name)->exists();
    }

    public static function markInitialized(string $name): void
    {
        static::query()->upsert([['name' => $name, 'updated_at' => now()]], ['name'], ['updated_at']);
    }
}
