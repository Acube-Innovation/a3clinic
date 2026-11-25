<?php

namespace App\Support;

use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\ImageManager;
use InvalidArgumentException;

/**
 * Stores images and videos sent through the Claude connector in the web
 * root's uploads/ folder (the same place admin uploads go) and returns the
 * site-root path content refers to: /uploads/<uuid>.jpg, /uploads/videos/<uuid>.mp4.
 *
 * The type is decided from the file's bytes, never its name, so a renamed
 * script can't land in uploads/.
 */
final class MediaStore
{
    public const IMAGE_TYPES = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];

    public const VIDEO_TYPES = ['video/mp4' => 'mp4', 'video/webm' => 'webm'];

    public const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

    /** GoDaddy's upload_max_filesize is 30M; videos above this belong on YouTube. */
    public const MAX_VIDEO_BYTES = 30 * 1024 * 1024;

    /** Wider photos are scaled down: nothing on the site displays more. */
    public const MAX_IMAGE_WIDTH = 2000;

    /**
     * Store the file at $path; returns ['path' => '/uploads/…', 'type' => 'image'|'video', 'bytes' => int].
     *
     * @throws InvalidArgumentException for anything that isn't a supported image or video
     */
    public static function store(string $path, bool $watermark = false): array
    {
        $mime = self::mime($path);

        if (isset(self::IMAGE_TYPES[$mime])) {
            self::assertSize($path, self::MAX_IMAGE_BYTES, 'Images');
            $stored = $watermark ? Watermark::store($path) : self::storeImage($path, $mime);

            return self::result($stored, 'image');
        }

        if (isset(self::VIDEO_TYPES[$mime])) {
            if ($watermark) {
                throw new InvalidArgumentException('Only photos can be watermarked, not videos.');
            }
            self::assertSize($path, self::MAX_VIDEO_BYTES, 'Videos');
            $stored = 'uploads/videos/'.Str::uuid().'.'.self::VIDEO_TYPES[$mime];
            self::ensureDir(dirname(public_path($stored)));
            copy($path, public_path($stored));

            return self::result($stored, 'video');
        }

        throw new InvalidArgumentException("Unsupported file type ({$mime}). Use JPEG, PNG or WebP images, or MP4/WebM videos.");
    }

    /** The real MIME type from the bytes. */
    public static function mime(string $path): string
    {
        return (string) (new \finfo(FILEINFO_MIME_TYPE))->file($path);
    }

    private static function storeImage(string $path, string $mime): string
    {
        $stored = 'uploads/'.Str::uuid().'.'.self::IMAGE_TYPES[$mime];
        self::ensureDir(dirname(public_path($stored)));

        [$width] = @getimagesize($path) ?: [0];
        if ($width > self::MAX_IMAGE_WIDTH) {
            ImageManager::usingDriver(GdDriver::class)->decodePath($path)
                ->orient()
                ->scaleDown(width: self::MAX_IMAGE_WIDTH)
                ->save(public_path($stored), quality: 85);
        } else {
            copy($path, public_path($stored));
        }

        return $stored;
    }

    private static function assertSize(string $path, int $max, string $what): void
    {
        if (filesize($path) > $max) {
            throw new InvalidArgumentException(sprintf('%s can be at most %d MB.', $what, $max / 1024 / 1024));
        }
    }

    private static function ensureDir(string $dir): void
    {
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }

    private static function result(string $stored, string $type): array
    {
        return ['path' => '/'.$stored, 'type' => $type, 'bytes' => filesize(public_path($stored))];
    }
}
