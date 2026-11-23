<?php

namespace App\Filament\Resources\Products\Pages;

use App\Filament\Resources\Products\ProductResource;
use App\Filament\Support\CreatesContentRecord;
use Filament\Resources\Pages\CreateRecord;

class CreateProduct extends CreateRecord
{
    use CreatesContentRecord;

    protected static string $resource = ProductResource::class;

    protected static function section(): string
    {
        return 'products';
    }

    protected static function titleField(): string
    {
        return 'name';
    }
}
