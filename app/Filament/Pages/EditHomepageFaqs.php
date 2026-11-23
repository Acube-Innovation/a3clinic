<?php

namespace App\Filament\Pages;

use App\Filament\Support\ContentSingletonPage;
use App\Filament\Support\Fields;
use BackedEnum;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Support\Icons\Heroicon;

/** The homepage (and consultation page) FAQ list. */
class EditHomepageFaqs extends ContentSingletonPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedQuestionMarkCircle;

    protected static ?string $navigationLabel = 'Homepage FAQs';

    protected static ?string $title = 'Homepage FAQs';

    protected static ?string $slug = 'faqs';

    protected static ?int $navigationSort = 4;

    protected static function section(): string
    {
        return 'faqs';
    }

    protected function toForm(mixed $items): array
    {
        return ['items' => $items];
    }

    protected function fromForm(array $form): array
    {
        return array_values($form['items'] ?? []);
    }

    protected function fields(): array
    {
        return [
            Fields::repeater('items', 'FAQs', [TextInput::make('question')->required(), Textarea::make('answer')->required()->rows(3)])
                ->itemLabel(fn (array $state) => $state['question'] ?? null),
        ];
    }
}
