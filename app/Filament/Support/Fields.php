<?php

namespace App\Filament\Support;

use App\Support\Watermark;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Illuminate\Support\Str;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

/**
 * The field kinds of the old admin's declarative schemas (src/lib/admin/
 * schemas.ts) as Filament components. Forms hold content in its section
 * shape (camelCase keys, string lists, nested objects) and save through
 * App\Support\ContentStore, exactly like the old RecordForm.
 */
final class Fields
{
    /** string[] edited as one entry per line. */
    public static function lines(string $name, string $label, ?string $hint = null): Textarea
    {
        return Textarea::make($name)
            ->label($label)
            ->helperText($hint)
            ->rows(6)
            ->formatStateUsing(fn ($state) => is_array($state) ? implode("\n", $state) : $state)
            ->dehydrateStateUsing(fn ($state) => is_array($state) ? array_values($state) : array_values(array_filter(
                array_map('trim', preg_split('/\R/', (string) $state)),
                fn ($line) => $line !== '',
            )));
    }

    /**
     * An uploaded image stored in public/uploads as <uuid>.<ext>. With
     * $watermark, the clinic watermark is baked into the pixels on upload.
     */
    public static function image(string $name, string $label, ?string $hint = null, bool $watermark = false): FileUpload
    {
        $field = FileUpload::make($name)
            ->label($label)
            ->helperText($hint)
            ->disk('site')
            ->directory('uploads')
            ->visibility('public')
            ->image()
            ->maxSize(5 * 1024)
            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
            ->getUploadedFileNameForStorageUsing(fn (TemporaryUploadedFile $file) => Str::uuid().'.'.strtolower($file->getClientOriginalExtension()))
            // Content stores site-root URLs (/uploads/x.jpg); the disk wants relative paths.
            ->formatStateUsing(fn ($state) => match (true) {
                is_string($state) && $state !== '' => ltrim($state, '/'),
                is_array($state) => array_map(fn ($path) => is_string($path) ? ltrim($path, '/') : $path, $state),
                default => $state ?: null,
            });

        if ($watermark) {
            $field->saveUploadedFileUsing(fn (TemporaryUploadedFile $file) => Watermark::store($file->getRealPath()));
        }

        return $field;
    }

    /** Rupees in the form, paise in the content. Zero or blank means "none" when $optional. */
    public static function price(string $name, string $label, ?string $hint = null, bool $optional = false): TextInput
    {
        return TextInput::make($name)
            ->label($label)
            ->helperText($hint)
            ->numeric()
            ->minValue(0)
            ->prefix('₹')
            ->formatStateUsing(fn ($state) => $state === null ? null : $state / 100)
            ->dehydrateStateUsing(fn ($state) => ($state === null || $state === '' || ($optional && (float) $state === 0.0))
                ? ($optional ? null : 0)
                : (int) round($state * 100));
    }

    /** A list of small objects (FAQs, timeline entries…). */
    public static function repeater(string $name, string $label, array $schema, ?string $hint = null): Repeater
    {
        return Repeater::make($name)
            ->label($label)
            ->helperText($hint)
            ->schema($schema)
            ->defaultItems(0)
            ->collapsible()
            ->reorderableWithButtons()
            ->addActionLabel('Add');
    }

    /**
     * Turn the disk paths FileUpload returns ("uploads/x.jpg") back into the
     * site-root URLs the content uses ("/uploads/x.jpg"), anywhere in $data.
     */
    public static function normalizeUploads(array $data): array
    {
        array_walk_recursive($data, function (&$value) {
            if (is_string($value) && preg_match('#^(uploads|images)/[^/\s]+$#', $value)) {
                $value = '/'.$value;
            }
        });

        return $data;
    }
}
