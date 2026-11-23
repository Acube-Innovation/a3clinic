<?php

namespace App\Filament\Resources\Appointments;

use App\Filament\Resources\Appointments\Pages\ListAppointments;
use App\Filament\Resources\Appointments\Pages\ViewAppointment;
use App\Models\Appointment;
use BackedEnum;
use Filament\Actions\ViewAction;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\SelectColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use UnitEnum;

/** Booking requests from the public site (the old /admin/appointments inbox). */
class AppointmentResource extends Resource
{
    public const STATUSES = [
        'pending' => 'Pending',
        'confirmed' => 'Confirmed',
        'completed' => 'Completed',
        'cancelled' => 'Cancelled',
    ];

    protected static ?string $model = Appointment::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCalendarDays;

    protected static string|UnitEnum|null $navigationGroup = 'Inbox';

    protected static ?int $navigationSort = 1;

    protected static ?string $recordTitleAttribute = 'name';

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getNavigationBadge(): ?string
    {
        $pending = Appointment::where('status', 'pending')->count();

        return $pending ? (string) $pending : null;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('position')
            ->columns([
                TextColumn::make('name')->searchable()->weight('medium')->description(fn ($record) => $record->phone),
                TextColumn::make('concern')->badge()->color('gray'),
                TextColumn::make('mode')->formatStateUsing(fn ($state) => $state === 'clinic' ? 'Clinic' : 'Online'),
                TextColumn::make('date')->label('Requested slot')->formatStateUsing(fn ($state, $record) => "{$state} · {$record->time}"),
                SelectColumn::make('status')->options(self::STATUSES)->selectablePlaceholder(false),
                TextColumn::make('created_at')->label('Received')->formatStateUsing(fn ($state) => $state ? date('d M Y, H:i', strtotime($state)) : '')->color('gray'),
            ])
            ->filters([SelectFilter::make('status')->options(self::STATUSES)])
            ->recordActions([ViewAction::make()]);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Patient')->columns(3)->schema([
                TextEntry::make('name'),
                TextEntry::make('phone')->copyable(),
                TextEntry::make('email')->copyable(),
                TextEntry::make('age'),
                TextEntry::make('gender'),
            ]),
            Section::make('Appointment')->columns(3)->schema([
                TextEntry::make('mode')->formatStateUsing(fn ($state) => $state === 'clinic' ? 'Clinic' : 'Online'),
                TextEntry::make('concern'),
                TextEntry::make('status')->badge()->formatStateUsing(fn ($state) => self::STATUSES[$state] ?? $state),
                TextEntry::make('date'),
                TextEntry::make('time'),
                TextEntry::make('created_at')->label('Received'),
                TextEntry::make('notes')->columnSpanFull()->placeholder('—'),
                TextEntry::make('files.filename')->label('Reports (filenames)')->listWithLineBreaks()->placeholder('None')->columnSpanFull(),
            ]),
        ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAppointments::route('/'),
            'view' => ViewAppointment::route('/{record}'),
        ];
    }
}
