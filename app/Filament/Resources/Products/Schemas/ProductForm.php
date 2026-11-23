<?php

namespace App\Filament\Resources\Products\Schemas;

use App\Filament\Support\Fields;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

/** Fields and help text from productFields in the old src/lib/admin/schemas.ts. */
class ProductForm
{
    public const CATEGORIES = [
        'hair-oil' => 'Hair Oil',
        'hair-serum' => 'Hair Serum',
        'shampoo' => 'Shampoo',
        'conditioner' => 'Conditioner',
        'hair-kit' => 'Hair Kit',
        'skin-care' => 'Skin Care',
        'medicine' => 'Medicine',
        'supplements' => 'Supplements',
    ];

    public static function configure(Schema $schema): Schema
    {
        return $schema->columns(1)->components([
            Section::make('Product')->columns(2)->schema([
                TextInput::make('name')->label('Product name')->required(),
                Select::make('category')->options(self::CATEGORIES)->required(),
                Fields::image('image', 'Product photo', 'Square images (around 1200×1200) work best. Shown on shop cards and the product page.')->columnSpanFull(),
                TextInput::make('tagline')->required()->columnSpanFull(),
                Textarea::make('description')->required()->rows(4)->columnSpanFull(),
                Fields::price('price', 'Price (₹)')->required(),
                Fields::price('compareAtPrice', 'Compare-at price (₹)', 'Optional. Shown struck through; leave 0 for none.', optional: true),
                TextInput::make('size')->label('Pack size')->required(),
                Toggle::make('inStock')->label('In stock'),
                Toggle::make('featured')->label('Featured on homepage'),
                Toggle::make('bestseller')->label('Bestseller badge'),
            ]),
            Section::make('Details')->schema([
                Fields::lines('benefits', 'Benefits', 'One per line. Support claims only — never cures.'),
                Fields::repeater('ingredients', 'Ingredients', [
                    TextInput::make('name')->label('Ingredient'),
                    TextInput::make('role'),
                ])->columns(2),
                Fields::lines('directions', 'Directions', 'One step per line.'),
                Textarea::make('caution')->label('Safety information')->required()->rows(3)
                    ->helperText('Shown verbatim on the product page. Do not weaken this copy.'),
            ]),
        ]);
    }
}
