<?php

namespace App\Filament\Resources\Appointments\Pages;

use App\Filament\Resources\Appointments\AppointmentResource;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Resources\Pages\ViewRecord;

class ViewAppointment extends ViewRecord
{
    protected static string $resource = AppointmentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('status')->label('Change status')
                ->fillForm(fn () => ['status' => $this->record->status])
                ->schema([Select::make('status')->options(AppointmentResource::STATUSES)->required()])
                ->action(fn (array $data) => $this->record->update(['status' => $data['status']])),
        ];
    }
}
