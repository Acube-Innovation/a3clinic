<?php

namespace App\Filament\Resources\Posts\Pages;

use App\Filament\Resources\Posts\PostResource;
use App\Filament\Support\EditsContentRecord;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPost extends EditRecord
{
    use EditsContentRecord;

    protected static string $resource = PostResource::class;

    protected static function section(): string
    {
        return 'posts';
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('view')->label('View on site')->color('gray')
                ->url(fn () => "/en/blog/{$this->record->slug}", shouldOpenInNewTab: true),
            DeleteAction::make(),
        ];
    }
}
