<?php

namespace App\Filament\Resources\CaseReports\Schemas;

use App\Filament\Support\Fields;
use App\Models\Condition;
use App\Support\CaseReports;
use Closure;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Str;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

/**
 * An anonymised case report. Nothing here may identify the patient: no names,
 * no exact dates of birth, no faces unless the consent explicitly covers it.
 */
class CaseReportForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->columns(1)->components([
            Section::make('Case')->columns(2)->schema([
                // Carried for the publish rule and the notice; not editable, so
                // a real case can't be flagged "sample" to skip consent.
                Hidden::make('sample')->dehydrated(false),
                Placeholder::make('sampleNotice')->hiddenLabel()->columnSpanFull()
                    ->visible(fn (Get $get) => (bool) $get('sample'))
                    ->content(new HtmlString('<strong>Sample case</strong> — illustrative placeholder content, labelled as such on the site and never shown in production. Replace the photos and text with a real consented case, or delete it.')),
                TextInput::make('code')->label('Case code')->required()->maxLength(64)
                    ->placeholder('HF-2026-014')
                    ->helperText('Shown publicly and used in the page address. Must not contain the patient\'s name, initials or file number.')
                    ->disabledOn('edit'),
                Select::make('conditionSlug')->label('Condition')->required()->searchable()
                    ->options(fn () => Condition::orderBy('name')->pluck('name', 'slug')->all()),
                TextInput::make('title')->label('Headline')->required()->columnSpanFull()
                    ->placeholder('Diffuse hair fall after a thyroid diagnosis')
                    ->helperText('Describes the case, not the outcome. Avoid "cured", "miracle", "guaranteed".'),
                Textarea::make('summary')->rows(2)->required()->columnSpanFull()
                    ->helperText('One or two sentences for cards and search results.'),
                Select::make('sex')->options(CaseReports::SEXES),
                TextInput::make('ageBand')->label('Age band')->placeholder('30–35')
                    ->helperText('A range, never an exact age.'),
                TextInput::make('complaintDuration')->label('Complaint duration before treatment')->placeholder('2 years'),
                TextInput::make('followUp')->label('Follow-up period documented')->placeholder('9 months'),
            ]),

            Section::make('Case notes')->schema([
                Textarea::make('presentation')->label('Presenting complaint')->rows(4),
                Textarea::make('history')->label('Relevant history')->rows(4)
                    ->helperText('Leave out anything that could identify the patient (workplace, town, family details).'),
                Textarea::make('assessment')->rows(4)
                    ->helperText('Findings at the first consultation: examination, trichoscopy, investigations.'),
                Fields::lines('approach', 'Treatment approach', 'One step per line, in order.'),
                Textarea::make('remedies')->label('Remedies prescribed (optional)')->rows(2)
                    ->helperText('Shown only if filled. Leave blank to describe the approach in general terms.'),
                Textarea::make('outcome')->label('Observed outcome')->rows(4)
                    ->helperText('What was observed and documented, including what did not change. No promises or guarantees.'),
                Textarea::make('doctorNote')->label("Doctor's note")->rows(2),
            ]),

            Section::make('Photo timeline')
                ->description('One entry per visit, oldest first. Photos are watermarked and have camera/location data removed on upload. Take every visit from the same angles, in the same light.')
                ->schema([
                    Fields::repeater('stages', 'Visits', [
                        TextInput::make('label')->required()->placeholder('Baseline'),
                        TextInput::make('timepoint')->placeholder('Month 3'),
                        Textarea::make('note')->label('Observations')->rows(2)->columnSpanFull(),
                        Fields::repeater('photos', 'Photos', [
                            Select::make('view')->options(array_combine(CaseReports::VIEWS, CaseReports::VIEWS))->default('Front')->required(),
                            Fields::image('image', 'Photo', watermark: true)->required(),
                        ], 'Use the same views at every visit so they can be compared.')->columns(2)->columnSpanFull(),
                    ])->columns(2)->itemLabel(fn (array $state) => trim(($state['label'] ?? '').' '.(($state['timepoint'] ?? '') ? "· {$state['timepoint']}" : '')) ?: null),
                ]),

            Section::make('Consent & publishing')->columns(2)
                ->description('COMPLIANCE: publish only with written, signed, revocable consent that covers website use of these photographs. Have the results pages reviewed by the clinic\'s legal counsel before launch.')
                ->schema([
                    Toggle::make('consentOnFile')->label('Signed consent on file')->live(),
                    DatePicker::make('consentDate')->label('Consent signed on'),
                    FileUpload::make('consentDocument')->label('Signed consent form (private)')->columnSpanFull()
                        ->helperText('Stored privately: never shown on the site. PDF or photo of the signed form.')
                        ->disk('local')->directory('consents')->visibility('private')
                        ->acceptedFileTypes(['application/pdf', 'image/jpeg', 'image/png'])
                        ->maxSize(10 * 1024)->downloadable()->openable()
                        ->formatStateUsing(fn ($state) => $state ?: null)
                        ->getUploadedFileNameForStorageUsing(fn (TemporaryUploadedFile $file) => Str::uuid().'.'.strtolower($file->getClientOriginalExtension())),
                    Toggle::make('published')->label('Published on the website')
                        ->rule(fn (Get $get) => function (string $attribute, mixed $value, Closure $fail) use ($get) {
                            $problem = CaseReports::publishProblem([
                                'published' => $value,
                                'sample' => $get('sample'),
                                'consentOnFile' => $get('consentOnFile'),
                                'consentDate' => $get('consentDate'),
                            ]);
                            if ($problem) {
                                $fail($problem);
                            }
                        }),
                    Toggle::make('featured')
                        ->helperText('Featured cases appear in the progress section on the home and hair-treatment pages.'),
                    Toggle::make('noindex')->label('Hide from search engines')
                        ->helperText('The page stays reachable by link but is not listed on Google.'),
                ]),
        ]);
    }
}
