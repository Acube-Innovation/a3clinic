<?php

namespace App\Filament\Resources\CaseReports\Pages;

use App\Filament\Resources\CaseReports\CaseReportResource;
use App\Filament\Support\EditsContentRecord;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCaseReport extends EditRecord
{
    use EditsContentRecord;

    protected static string $resource = CaseReportResource::class;

    protected static function section(): string
    {
        return 'cases';
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('view')->label(fn () => $this->record->published ? 'View on site' : 'Preview draft')->color('gray')
                ->url(fn () => "/en/results/{$this->record->slug}", shouldOpenInNewTab: true),
            DeleteAction::make(),
        ];
    }
}
