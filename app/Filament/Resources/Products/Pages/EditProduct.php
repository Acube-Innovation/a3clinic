<?php

namespace App\Filament\Resources\Products\Pages;

use App\Filament\Resources\Products\ProductResource;
use App\Filament\Support\EditsContentRecord;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditProduct extends EditRecord
{
    use EditsContentRecord;

    protected static string $resource = ProductResource::class;

    protected static function section(): string
    {
        return 'products';
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('view')->label('View on site')->color('gray')
                ->url(fn () => "/en/shop/{$this->record->slug}", shouldOpenInNewTab: true),
            DeleteAction::make(),
        ];
    }
}
