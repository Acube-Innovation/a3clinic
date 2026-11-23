<?php

namespace App\Filament\Resources\Conditions\Pages;

use App\Filament\Resources\Conditions\ConditionResource;
use App\Filament\Support\EditsContentRecord;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCondition extends EditRecord
{
    use EditsContentRecord;

    protected static string $resource = ConditionResource::class;

    protected static function section(): string
    {
        return 'conditions';
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('view')->label('View on site')->color('gray')
                ->url(fn () => "/en/conditions/{$this->record->slug}", shouldOpenInNewTab: true),
            DeleteAction::make(),
        ];
    }
}
