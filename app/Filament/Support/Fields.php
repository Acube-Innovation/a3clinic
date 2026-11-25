<?php

namespace App\Filament\Support;

use App\Support\MediaStore;
use App\Support\VideoSource;
use App\Support\Watermark;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Group;
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

    /**
     * A video: a YouTube link typed in, or an MP4/WebM uploaded to
     * public/uploads/videos. The upload lands in "<name>Upload" and
     * normalizeUploads() moves it into <name> on save.
     */
    public static function video(string $name, string $label = 'Video', ?string $hint = null): Group
    {
        return Group::make([
            TextInput::make($name)
                ->label($label)
                ->helperText($hint ?? 'Paste a YouTube link, or upload a short MP4 below (max 30 MB). Leave blank for none.')
                ->placeholder('https://www.youtube.com/watch?v=…')
                ->rule(fn () => function (string $attribute, mixed $value, \Closure $fail) {
                    if (filled($value) && ! VideoSource::isValid($value)) {
                        $fail('Use a YouTube link or an uploaded video.');
                    }
                })
                ->dehydrateStateUsing(fn ($state) => VideoSource::isValid($state) ? VideoSource::normalize($state) : $state),
            FileUpload::make($name.'Upload')
                ->label('Upload a video file instead')
                ->disk('site')
                ->directory('uploads/videos')
                ->visibility('public')
                ->maxSize(MediaStore::MAX_VIDEO_BYTES / 1024)
                ->acceptedFileTypes(array_keys(MediaStore::VIDEO_TYPES))
                ->getUploadedFileNameForStorageUsing(fn (TemporaryUploadedFile $file) => Str::uuid().'.'.(MediaStore::VIDEO_TYPES[$file->getMimeType()] ?? 'mp4')),
        ]);
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
        $data = self::mergeVideoUploads($data);

        array_walk_recursive($data, function (&$value) {
            if (is_string($value) && preg_match('#^(uploads|images)/[^/\s]+$#', $value)) {
                $value = '/'.$value;
            }
        });

        return $data;
    }

    /** A freshly uploaded video file ("<key>Upload") replaces the typed <key>, at any depth. */
    private static function mergeVideoUploads(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = self::mergeVideoUploads($value);
            }
        }
        foreach ($data as $key => $value) {
            if (is_string($key) && str_ends_with($key, 'Upload') && array_key_exists($base = substr($key, 0, -6), $data)) {
                $file = is_array($value) ? (array_values($value)[0] ?? null) : $value;
                if (is_string($file) && $file !== '') {
                    $data[$base] = '/'.ltrim($file, '/');
                }
                unset($data[$key]);
            }
        }

        return $data;
    }
}
