<?php

namespace App\Filament\Resources\Conditions\Pages;

use App\Filament\Resources\Conditions\ConditionResource;
use App\Filament\Support\CreatesContentRecord;
use Filament\Resources\Pages\CreateRecord;

class CreateCondition extends CreateRecord
{
    use CreatesContentRecord;

    protected static string $resource = ConditionResource::class;

    protected static function section(): string
    {
        return 'conditions';
    }

    protected static function titleField(): string
    {
        return 'name';
    }
}
