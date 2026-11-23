<?php

namespace App\Filament\Resources\Testimonials\Tables;

use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class TestimonialsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('position')
            ->reorderable('position')
            ->columns([
                TextColumn::make('author')->searchable()->weight('medium')->description(fn ($record) => str($record->quote)->limit(90)),
                TextColumn::make('location'),
                IconColumn::make('consent_on_file')->label('Consent')->boolean(),
            ])
            ->recordActions([EditAction::make(), DeleteAction::make()]);
    }
}
