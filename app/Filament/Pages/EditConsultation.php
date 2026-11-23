<?php

namespace App\Filament\Pages;

use App\Filament\Support\ContentSingletonPage;
use App\Filament\Support\Fields;
use BackedEnum;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Support\Icons\Heroicon;

/** Consultation page copy (consultationFields in the old schemas.ts). */
class EditConsultation extends ContentSingletonPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedVideoCamera;

    protected static ?string $navigationLabel = 'Consultation Page';

    protected static ?string $title = 'Consultation Page';

    protected static ?string $slug = 'consultation';

    protected static ?int $navigationSort = 3;

    protected static function section(): string
    {
        return 'consultation';
    }

    protected function current(): mixed
    {
        return $this->siteData()->consultation();
    }

    protected function fields(): array
    {
        return [
            Fields::repeater('prepare', '"What to have ready" items', [TextInput::make('title'), Textarea::make('detail')->rows(2)],
                'Shown on the consultation page under Before your appointment.'),
            Textarea::make('deliveryNote')->label('Medicine delivery note')->rows(4)
                ->helperText('The paragraph under Medicine delivery on the consultation page.'),
        ];
    }
}
