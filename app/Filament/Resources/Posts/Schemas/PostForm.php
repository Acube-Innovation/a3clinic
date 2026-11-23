<?php

namespace App\Filament\Resources\Posts\Schemas;

use App\Filament\Support\Fields;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;

/** Fields and help text from postFields in the old src/lib/admin/schemas.ts. */
class PostForm
{
    public const CATEGORIES = [
        'hair-tips' => 'Hair Tips',
        'homeopathy' => 'Homeopathy',
        'nutrition' => 'Nutrition',
        'lifestyle' => 'Lifestyle',
        'womens-health' => "Women's Health",
        'children' => 'Children',
    ];

    public static function configure(Schema $schema): Schema
    {
        return $schema->columns(1)->components([
            Section::make('Post')->columns(2)->schema([
                TextInput::make('title')->required()->columnSpanFull(),
                Select::make('category')->options(self::CATEGORIES)->required(),
                DatePicker::make('publishedAt')->label('Publish date')->required()->native(false)->format('Y-m-d'),
                Fields::image('image', 'Cover image', 'Wide images (around 1600×1000) work best. Shown on blog cards and at the top of the article.')->columnSpanFull(),
                Textarea::make('excerpt')->required()->rows(3)->columnSpanFull(),
                TextInput::make('readingMinutes')->label('Reading minutes')->numeric()->minValue(1),
                Toggle::make('featured'),
            ]),
            Section::make('Article body')->description('Blocks render in order.')->schema([
                Fields::repeater('body', 'Blocks', [
                    Select::make('type')->label('Block type')->required()->live()->default('paragraph')->options([
                        'paragraph' => 'Paragraph',
                        'heading' => 'Heading',
                        'list' => 'Bullet list',
                        'callout' => 'Callout',
                    ]),
                    Textarea::make('text')->rows(4)->visible(fn (Get $get) => $get('type') !== 'list'),
                    Fields::lines('items', 'Items', 'One item per line.')->visible(fn (Get $get) => $get('type') === 'list'),
                ])->itemLabel(fn (array $state) => ucfirst($state['type'] ?? 'block').': '.str($state['text'] ?? implode(', ', (array) ($state['items'] ?? [])))->limit(60)),
            ]),
        ]);
    }
}
