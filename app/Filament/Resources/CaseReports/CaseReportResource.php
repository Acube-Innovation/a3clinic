<?php

namespace App\Filament\Resources\CaseReports;

use App\Filament\Resources\CaseReports\Pages\CreateCaseReport;
use App\Filament\Resources\CaseReports\Pages\EditCaseReport;
use App\Filament\Resources\CaseReports\Pages\ListCaseReports;
use App\Filament\Resources\CaseReports\Schemas\CaseReportForm;
use App\Filament\Resources\CaseReports\Tables\CaseReportsTable;
use App\Models\CaseReport;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class CaseReportResource extends Resource
{
    protected static ?string $model = CaseReport::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedPhoto;

    protected static ?string $navigationLabel = 'Case Reports & Results';

    protected static ?string $modelLabel = 'case report';

    protected static string|UnitEnum|null $navigationGroup = 'Content';

    protected static ?int $navigationSort = 2;

    protected static ?string $recordTitleAttribute = 'code';

    public static function form(Schema $schema): Schema
    {
        return CaseReportForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CaseReportsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCaseReports::route('/'),
            'create' => CreateCaseReport::route('/create'),
            'edit' => EditCaseReport::route('/{record}/edit'),
        ];
    }
}
