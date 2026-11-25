<?php

namespace App\Filament\Resources\CaseReports\Pages;

use App\Filament\Resources\CaseReports\CaseReportResource;
use App\Filament\Support\CreatesContentRecord;
use Filament\Resources\Pages\CreateRecord;

class CreateCaseReport extends CreateRecord
{
    use CreatesContentRecord;

    protected static string $resource = CaseReportResource::class;

    protected static function section(): string
    {
        return 'cases';
    }

    /** The URL slug comes from the case code (HF-2026-014 → hf-2026-014). */
    protected static function titleField(): string
    {
        return 'code';
    }
}
