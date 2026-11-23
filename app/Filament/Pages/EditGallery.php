<?php

namespace App\Filament\Pages;

use App\Filament\Support\ContentSingletonPage;
use App\Filament\Support\Fields;
use BackedEnum;
use Filament\Forms\Components\TextInput;
use Filament\Support\Icons\Heroicon;

/** Clinic photos for the About page gallery. */
class EditGallery extends ContentSingletonPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedPhoto;

    protected static ?string $navigationLabel = 'Clinic Photos';

    protected static ?string $title = 'Clinic Photos';

    protected static ?string $slug = 'gallery';

    protected static ?int $navigationSort = 5;

    protected static function section(): string
    {
        return 'gallery';
    }

    protected function toForm(mixed $items): array
    {
        return ['items' => $items];
    }

    protected function fromForm(array $form): array
    {
        return array_values($form['items'] ?? []);
    }

    protected function fields(): array
    {
        return [
            Fields::repeater('items', 'Clinic photos', [Fields::image('image', 'Photo')->required(), TextInput::make('label')->label('Caption')],
                'Shown in the About page\'s "Where consultations happen" gallery, in this order. Never upload a patient photo without written consent.')
                ->columns(2),
        ];
    }
}
