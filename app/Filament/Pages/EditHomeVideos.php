<?php

namespace App\Filament\Pages;

use App\Filament\Support\ContentSingletonPage;
use App\Filament\Support\Fields;
use BackedEnum;
use Filament\Forms\Components\TextInput;
use Filament\Support\Icons\Heroicon;

/** The home page "From the clinic" video section. */
class EditHomeVideos extends ContentSingletonPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedFilm;

    protected static ?string $navigationLabel = 'Home Videos';

    protected static ?string $title = 'Home Videos';

    protected static ?string $slug = 'videos';

    protected static ?int $navigationSort = 6;

    protected static function section(): string
    {
        return 'videos';
    }

    protected function toForm(mixed $items): array
    {
        return ['items' => $items];
    }

    protected function fromForm(array $form): array
    {
        return array_values(array_filter($form['items'] ?? [], fn ($v) => filled($v['video'] ?? null)));
    }

    protected function fields(): array
    {
        return [
            Fields::repeater('items', 'Videos', [
                TextInput::make('title')->label('Title'),
                Fields::video('video'),
            ], 'Shown on the home page in this order (the section is hidden when empty). Never show a patient without written consent.'),
        ];
    }
}
