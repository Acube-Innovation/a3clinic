<?php

namespace App\Filament\Resources\Conditions\Tables;

use App\Filament\Resources\Conditions\Schemas\ConditionForm;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class ConditionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('position')
            ->columns([
                TextColumn::make('name')->searchable()->weight('medium')
                    ->description(fn ($record) => str($record->summary)->limit(90)),
                TextColumn::make('category')->badge()->formatStateUsing(fn ($state) => ConditionForm::CATEGORIES[$state] ?? $state),
                IconColumn::make('featured')->boolean(),
            ])
            ->filters([
                SelectFilter::make('category')->options(ConditionForm::CATEGORIES),
                TernaryFilter::make('featured'),
            ])
            ->recordActions([EditAction::make(), DeleteAction::make()]);
    }
}
