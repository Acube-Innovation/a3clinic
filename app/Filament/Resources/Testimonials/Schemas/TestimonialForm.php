<?php

namespace App\Filament\Resources\Testimonials\Schemas;

use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

/** Fields and help text from testimonialFields in the old src/lib/admin/schemas.ts. */
class TestimonialForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->columns(1)->components([
            Section::make()->columns(2)->schema([
                TextInput::make('author')->label('Patient name (as displayed)')->required(),
                TextInput::make('location'),
                Textarea::make('quote')->required()->rows(4)->columnSpanFull()
                    ->helperText('Describe the experience of care, never a treatment outcome.'),
                TextInput::make('context')->label('Context line')->columnSpanFull()
                    ->helperText('e.g. "Consulting since 2025 · Hair fall"'),
                Toggle::make('consent_on_file')->label('Written consent on file')->columnSpanFull()
                    ->helperText('Do not publish a real quote without signed consent.'),
            ]),
        ]);
    }
}
