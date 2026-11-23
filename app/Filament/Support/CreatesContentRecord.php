<?php

namespace App\Filament\Support;

use App\Support\ContentStore;
use Illuminate\Database\Eloquent\Model;

/**
 * Create pages for slug-keyed collections: the new record goes to the top of
 * its collection with a unique slug derived from its title field.
 */
trait CreatesContentRecord
{
    abstract protected static function section(): string;

    abstract protected static function titleField(): string;

    protected function handleRecordCreation(array $data): Model
    {
        $slug = app(ContentStore::class)->createRecord(static::section(), (string) $data[static::titleField()], Fields::normalizeUploads($data));

        return static::getModel()::findOrFail($slug);
    }
}
