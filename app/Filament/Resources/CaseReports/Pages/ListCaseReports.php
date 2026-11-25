<?php

namespace App\Filament\Resources\CaseReports\Pages;

use App\Filament\Pages\CaseConsentForm;
use App\Filament\Resources\CaseReports\CaseReportResource;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListCaseReports extends ListRecords
{
    protected static string $resource = CaseReportResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('consentForm')->label('Photo consent form')->color('gray')
                ->icon('heroicon-o-document-text')
                ->url(CaseConsentForm::getUrl()),
            Action::make('viewResults')->label('View results page')->color('gray')
                ->url('/en/results', shouldOpenInNewTab: true),
            CreateAction::make(),
        ];
    }
}
