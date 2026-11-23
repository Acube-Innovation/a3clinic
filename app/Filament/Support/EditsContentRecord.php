<?php

namespace App\Filament\Support;

use App\Support\ContentStore;
use Illuminate\Database\Eloquent\Model;

/**
 * Edit pages for slug-keyed collections (conditions, products, posts): the
 * form holds the record in its section shape and saves through ContentStore,
 * merging over the stored record so fields outside the form survive.
 *
 * @property Model $record
 */
trait EditsContentRecord
{
    abstract protected static function section(): string;

    protected function mutateFormDataBeforeFill(array $data): array
    {
        return app(ContentStore::class)->record(static::section(), $this->record->getKey()) ?? [];
    }

    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        app(ContentStore::class)->saveRecord(static::section(), $record->getKey(), Fields::normalizeUploads($data));

        return $record->refresh();
    }
}
