<?php

namespace App\Filament\Resources\Products\Tables;

use App\Filament\Resources\Products\Schemas\ProductForm;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('position')
            ->columns([
                ImageColumn::make('image')->disk('site')->square()
                    ->getStateUsing(fn ($record) => $record->image ? ltrim($record->image, '/') : null),
                TextColumn::make('name')->searchable()->weight('medium')->description(fn ($record) => $record->tagline),
                TextColumn::make('category')->badge()->formatStateUsing(fn ($state) => ProductForm::CATEGORIES[$state] ?? $state),
                TextColumn::make('price')->formatStateUsing(fn ($state) => '₹'.number_format($state / 100)),
                IconColumn::make('in_stock')->label('In stock')->boolean(),
                IconColumn::make('featured')->boolean(),
            ])
            ->filters([SelectFilter::make('category')->options(ProductForm::CATEGORIES)])
            ->recordActions([EditAction::make(), DeleteAction::make()]);
    }
}
