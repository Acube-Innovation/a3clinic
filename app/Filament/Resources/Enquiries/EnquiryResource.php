<?php

namespace App\Filament\Resources\Enquiries;

use App\Filament\Resources\Enquiries\Pages\ListEnquiries;
use App\Filament\Resources\Enquiries\Pages\ViewEnquiry;
use App\Models\Enquiry;
use BackedEnum;
use Filament\Actions\ViewAction;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use UnitEnum;

/** Messages from the contact form (the old /admin/enquiries inbox). */
class EnquiryResource extends Resource
{
    protected static ?string $model = Enquiry::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedInboxArrowDown;

    protected static string|UnitEnum|null $navigationGroup = 'Inbox';

    protected static ?int $navigationSort = 2;

    protected static ?string $recordTitleAttribute = 'name';

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getNavigationBadge(): ?string
    {
        $unread = Enquiry::where('read', false)->count();

        return $unread ? (string) $unread : null;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('position')
            ->columns([
                TextColumn::make('name')->searchable()->weight(fn ($record) => $record->read ? 'normal' : 'bold')
                    ->description(fn ($record) => str($record->message)->limit(80)),
                TextColumn::make('reason')->badge()->color('gray'),
                TextColumn::make('phone'),
                TextColumn::make('created_at')->label('Received')->formatStateUsing(fn ($state) => $state ? date('d M Y, H:i', strtotime($state)) : '')->color('gray'),
                ToggleColumn::make('read'),
            ])
            ->filters([TernaryFilter::make('read')])
            ->recordActions([ViewAction::make()]);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Section::make()->columns(3)->schema([
                TextEntry::make('name'),
                TextEntry::make('phone')->copyable(),
                TextEntry::make('email')->copyable()->placeholder('—'),
                TextEntry::make('reason'),
                TextEntry::make('created_at')->label('Received'),
                TextEntry::make('message')->columnSpanFull(),
            ]),
        ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListEnquiries::route('/'),
            'view' => ViewEnquiry::route('/{record}'),
        ];
    }
}
