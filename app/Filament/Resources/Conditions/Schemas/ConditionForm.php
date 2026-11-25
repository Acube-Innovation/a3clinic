<?php

namespace App\Filament\Resources\Conditions\Schemas;

use App\Filament\Support\Fields;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

/** Fields and help text from conditionFields in the old src/lib/admin/schemas.ts. */
class ConditionForm
{
    public const CATEGORIES = [
        'hair' => 'Hair & Scalp',
        'skin' => 'Skin',
        'chronic' => 'Chronic & Lifestyle',
        'womens' => "Women's Health",
        'child' => 'Child Care',
    ];

    public static function configure(Schema $schema): Schema
    {
        return $schema->columns(1)->components([
            Section::make('Condition')->columns(2)->schema([
                TextInput::make('name')->label('Condition name')->required(),
                Select::make('category')->options(self::CATEGORIES)->required(),
                Toggle::make('featured')->columnSpanFull()
                    ->helperText("Featured conditions appear in the header's Treatments dropdown, and hair conditions also feature on the hair-treatment page."),
                Textarea::make('summary')->required()->rows(2)->columnSpanFull()
                    ->helperText('One sentence. Used on cards and as the meta description.'),
                Textarea::make('intro')->label('Introduction')->required()->rows(5)->columnSpanFull(),
                Fields::image('heroImage', 'Header background image', "Shown behind this condition's page title. Wide images (around 1600×700) work best."),
                Fields::image('introImage', 'Introduction image', 'Shown beside the introduction — what the condition looks like. Use only images you have rights to; patient photos need written consent.'),
                Fields::video('video', 'Video', 'Shown after the introduction. Paste a YouTube link, or upload a short MP4 below (max 30 MB).')->columnSpanFull(),
            ]),
            Section::make('Details')->schema([
                Fields::lines('symptoms', 'Symptoms', 'One symptom per line.'),
                Fields::lines('causes', 'Causes', 'One cause per line.'),
                Fields::lines('treatment', 'Treatment approach', 'One step per line, in order.'),
                Fields::repeater('expectedResults', 'What to expect (timeline)', [
                    TextInput::make('phase'),
                    Textarea::make('detail')->rows(2),
                ], 'Keep wording indicative — no guaranteed outcomes.'),
                Fields::repeater('faqs', 'FAQs', [
                    TextInput::make('question'),
                    Textarea::make('answer')->rows(3),
                ]),
            ]),
            Section::make('Before & after photos')
                ->description('Shown on this condition\'s page, and collected into the site-wide progress section. Photos are watermarked automatically on upload. COMPLIANCE: publish a real patient pair only with written, signed, revocable consent on file, and never name the patient.')
                ->schema([
                    Fields::repeater('results', 'Pairs', [
                        Fields::image('before', 'Before photo', watermark: true),
                        Fields::image('after', 'After photo', watermark: true),
                        TextInput::make('label')->label('Case label')
                            ->helperText('e.g. "Photographs 6 months apart" — no names. Leave blank to use the condition name.'),
                        Textarea::make('note')->rows(2)
                            ->helperText('Optional context. Describe the documentation, not a promised outcome.'),
                    ])->columns(2),
                ]),
        ]);
    }
}
