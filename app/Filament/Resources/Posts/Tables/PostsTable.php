<?php

namespace App\Filament\Resources\Posts\Tables;

use App\Filament\Resources\Posts\Schemas\PostForm;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class PostsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('published_at', 'desc')
            ->columns([
                TextColumn::make('title')->searchable()->weight('medium')->description(fn ($record) => str($record->excerpt)->limit(90)),
                TextColumn::make('category')->badge()->formatStateUsing(fn ($state) => PostForm::CATEGORIES[$state] ?? $state),
                TextColumn::make('published_at')->label('Published')->sortable(),
                IconColumn::make('featured')->boolean(),
            ])
            ->filters([SelectFilter::make('category')->options(PostForm::CATEGORIES)])
            ->recordActions([EditAction::make(), DeleteAction::make()]);
    }
}
