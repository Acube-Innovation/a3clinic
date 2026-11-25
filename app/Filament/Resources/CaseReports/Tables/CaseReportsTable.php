<?php

namespace App\Filament\Resources\CaseReports\Tables;

use App\Models\Condition;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class CaseReportsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('position')
            ->columns([
                TextColumn::make('code')->searchable()->weight('medium')
                    ->description(fn ($record) => str($record->title)->limit(70)),
                TextColumn::make('condition.name')->label('Condition')->searchable(),
                TextColumn::make('follow_up')->label('Follow-up'),
                IconColumn::make('consent_on_file')->label('Consent')->boolean(),
                IconColumn::make('published')->boolean(),
                IconColumn::make('featured')->boolean(),
                TextColumn::make('sample')->label('')
                    ->formatStateUsing(fn ($state) => $state ? 'Sample' : null)
                    ->badge()->color('warning'),
            ])
            ->filters([
                SelectFilter::make('condition_slug')->label('Condition')
                    ->options(fn () => Condition::orderBy('name')->pluck('name', 'slug')->all())
                    ->searchable(),
                TernaryFilter::make('published'),
                TernaryFilter::make('consent_on_file')->label('Consent on file'),
                TernaryFilter::make('sample')->label('Sample cases'),
            ])
            ->recordActions([EditAction::make(), DeleteAction::make()]);
    }
}
