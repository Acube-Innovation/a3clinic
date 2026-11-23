<?php

namespace App\Filament\Pages;

use App\Filament\Support\ContentSingletonPage;
use App\Filament\Support\Fields;
use BackedEnum;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Support\Icons\Heroicon;

/** Contact details, hours and homepage counters (clinicFields in the old schemas.ts). */
class EditClinic extends ContentSingletonPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBuildingOffice2;

    protected static ?string $navigationLabel = 'Clinic & Contact';

    protected static ?string $title = 'Clinic & Contact';

    protected static ?string $slug = 'clinic';

    protected static ?int $navigationSort = 2;

    protected static function section(): string
    {
        return 'clinic';
    }

    protected function current(): mixed
    {
        // Merged over defaults so newly-added fields appear (getClinicSettings).
        return $this->siteData()->clinic();
    }

    protected function fields(): array
    {
        return [
            Section::make('Contact')->columns(2)->schema([
                TextInput::make('phone')->label('Phone number')->required()
                    ->helperText('10-digit mobile. Used across the site — header, footer, contact page, tap-to-call.'),
                TextInput::make('whatsapp')->label('WhatsApp number')->required(),
                TextInput::make('email')->email()->required()->columnSpanFull(),
            ]),
            Section::make('Address')->columns(2)->schema([
                TextInput::make('addressLine1')->label('Address line 1'),
                TextInput::make('addressLine2')->label('Address line 2'),
                TextInput::make('city')->label('Town / city'),
                TextInput::make('district'),
                TextInput::make('state'),
                TextInput::make('postalCode')->label('PIN code'),
                TextInput::make('mapQuery')->label('Map search override')->columnSpanFull()
                    ->helperText('Optional. Exact Google Maps search text for the map pin; leave blank to use the address above.'),
            ]),
            Section::make('Hours & statistics')->schema([
                Fields::repeater('hours', 'Consultation hours', [TextInput::make('days'), TextInput::make('time')])->columns(2),
                Fields::repeater('stats', 'Homepage statistics', [
                    TextInput::make('value')->label('Number')->numeric()->required(),
                    TextInput::make('suffix')->label('Suffix (e.g. +)'),
                    TextInput::make('label'),
                ], 'The counters on the homepage. Every figure must be verifiable from clinic records.')->columns(3),
            ]),
        ];
    }

    protected function fromForm(array $form): array
    {
        $form['stats'] = array_map(fn ($s) => [...$s, 'value' => (int) $s['value']], array_values($form['stats'] ?? []));

        return $form;
    }
}
