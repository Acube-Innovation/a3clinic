<?php

namespace App\Filament\Pages;

use App\Support\SiteData;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

/**
 * Printable photo-and-case-publication consent form (DRAFT, for the clinic's
 * legal review). Print it, have the patient sign, then upload the signed copy
 * on the case report.
 */
class CaseConsentForm extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedDocumentCheck;

    protected static ?string $navigationLabel = 'Photo Consent Form';

    protected static ?string $title = 'Photo & Case Report Consent Form';

    protected static ?string $slug = 'case-consent-form';

    protected static string|UnitEnum|null $navigationGroup = 'Content';

    protected static ?int $navigationSort = 3;

    protected string $view = 'filament.pages.case-consent-form';

    protected function getHeaderActions(): array
    {
        return [
            Action::make('print')->label('Print / save as PDF')->icon('heroicon-o-printer')
                ->alpineClickHandler('window.print()'),
        ];
    }

    protected function getViewData(): array
    {
        return ['clinic' => app(SiteData::class)->clinic()];
    }
}
