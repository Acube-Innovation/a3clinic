<?php

namespace App\Filament\Support;

use App\Support\ContentStore;
use App\Support\SiteData;
use Filament\Actions\Action;
use Filament\Forms\Components\Field;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Actions;
use Filament\Schemas\Components\Component;
use Filament\Schemas\Components\EmbeddedSchema;
use Filament\Schemas\Components\Form;
use Filament\Schemas\Schema;
use UnitEnum;

/**
 * An admin page editing one whole content section (doctor profile, clinic
 * settings…) — the old admin's "singleton" collections. The form works on a
 * flat shape; toForm()/fromForm() map to the section document, as
 * getSingletonForm/saveSingleton did in the old actions.ts.
 *
 * @property-read Schema $form
 */
abstract class ContentSingletonPage extends Page
{
    protected static string|UnitEnum|null $navigationGroup = 'Site settings';

    /** @var array<string, mixed> */
    public ?array $data = [];

    abstract protected static function section(): string;

    /** @return array<int, Component|Field> */
    abstract protected function fields(): array;

    /** Section document -> form state. */
    protected function toForm(mixed $document): array
    {
        return $document;
    }

    /** Form state -> section document. */
    protected function fromForm(array $state): mixed
    {
        return $state;
    }

    /** What visitors currently see (merged over defaults where the site does that). */
    protected function current(): mixed
    {
        return app(ContentStore::class)->read(static::section());
    }

    public function mount(): void
    {
        $this->form->fill($this->toForm($this->current()));
    }

    public function form(Schema $schema): Schema
    {
        return $schema->components($this->fields())->statePath('data');
    }

    public function content(Schema $schema): Schema
    {
        return $schema->components([
            Form::make([EmbeddedSchema::make('form')])
                ->id('form')
                ->livewireSubmitHandler('save')
                ->footer([Actions::make([Action::make('save')->label('Save changes')->submit('save')])->sticky()]),
        ]);
    }

    public function save(): void
    {
        $state = Fields::normalizeUploads($this->form->getState());
        app(ContentStore::class)->write(static::section(), $this->fromForm($state));
        app()->forgetScopedInstances();

        Notification::make()->success()->title('Saved — the site shows the changes now.')->send();
    }

    protected function siteData(): SiteData
    {
        return app(SiteData::class);
    }
}
