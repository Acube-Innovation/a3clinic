<?php

namespace App\Filament\Pages;

use App\Filament\Support\ContentSingletonPage;
use App\Filament\Support\Fields;
use BackedEnum;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Support\Icons\Heroicon;

/** The About page's doctor profile (doctorFields in the old schemas.ts). */
class EditDoctor extends ContentSingletonPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUserCircle;

    protected static ?string $navigationLabel = 'Doctor Profile';

    protected static ?string $title = 'Doctor Profile';

    protected static ?string $slug = 'doctor';

    protected static ?int $navigationSort = 1;

    protected static function section(): string
    {
        return 'doctor';
    }

    protected function toForm(mixed $doc): array
    {
        return [
            'bioIntro' => $doc['biography']['intro'] ?? '',
            'bioParagraphs' => $doc['biography']['paragraphs'] ?? [],
            'missionText' => $doc['mission']['mission'] ?? '',
            'visionText' => $doc['mission']['vision'] ?? '',
            'values' => $doc['mission']['values'] ?? [],
            'education' => $doc['education'] ?? [],
            'timeline' => $doc['timeline'] ?? [],
            'achievements' => $doc['achievements'] ?? [],
        ];
    }

    protected function fromForm(array $form): array
    {
        return [
            // The gallery slots aren't edited here; keep what is stored.
            ...$this->current(),
            'biography' => ['intro' => (string) $form['bioIntro'], 'paragraphs' => $form['bioParagraphs'] ?? []],
            'mission' => ['mission' => (string) $form['missionText'], 'vision' => (string) $form['visionText'], 'values' => array_values($form['values'] ?? [])],
            'education' => array_values($form['education'] ?? []),
            'timeline' => array_values($form['timeline'] ?? []),
            'achievements' => array_values($form['achievements'] ?? []),
        ];
    }

    protected function fields(): array
    {
        $titled = [TextInput::make('title'), Textarea::make('detail')->rows(2)];

        return [
            Section::make('Biography')->schema([
                Textarea::make('bioIntro')->label('Introduction')->required()->rows(3)->helperText('Also used as the About page subtitle.'),
                Fields::lines('bioParagraphs', 'Biography paragraphs', 'One paragraph per line.')->rows(10),
            ]),
            Section::make('Mission & values')->schema([
                Textarea::make('missionText')->label('Mission')->rows(3),
                Textarea::make('visionText')->label('Vision')->rows(3),
                Fields::repeater('values', 'Values', $titled),
            ]),
            Section::make('Credentials')->schema([
                Fields::repeater('education', 'Education', [
                    TextInput::make('year'), TextInput::make('qualification'), TextInput::make('institution'), Textarea::make('detail')->rows(2),
                ])->columns(2),
                Fields::repeater('timeline', 'Practice timeline', [TextInput::make('year'), ...$titled])->columns(3),
                Fields::repeater('achievements', 'Achievements', $titled),
            ]),
        ];
    }
}
