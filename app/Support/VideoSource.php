<?php

namespace App\Support;

use InvalidArgumentException;

/**
 * A video on the site is stored as one string: either a YouTube URL (kept as
 * the canonical https://www.youtube.com/watch?v=<id>) or the site-root path of
 * an uploaded file (/uploads/videos/<name>.mp4|webm).
 */
final class VideoSource
{
    private const YOUTUBE = '#^(?:https?://)?(?:www\.|m\.)?(?:youtube\.com/(?:watch\?(?:.*&)?v=|shorts/|embed/|live/)|youtu\.be/)([A-Za-z0-9_-]{11})(?:[?&\#/].*)?$#';

    private const UPLOAD = '#^/?uploads/videos/[A-Za-z0-9_-]+\.(mp4|webm)$#';

    /** The canonical stored value, '' for blank, or InvalidArgumentException. */
    public static function normalize(?string $value): string
    {
        $value = trim((string) $value);
        if ($value === '') {
            return '';
        }
        if (preg_match(self::YOUTUBE, $value, $m)) {
            return 'https://www.youtube.com/watch?v='.$m[1];
        }
        if (preg_match(self::UPLOAD, $value)) {
            return '/'.ltrim($value, '/');
        }

        throw new InvalidArgumentException("Not a YouTube link or an uploaded video (/uploads/videos/…): {$value}");
    }

    public static function isValid(?string $value): bool
    {
        try {
            self::normalize($value);

            return true;
        } catch (InvalidArgumentException) {
            return false;
        }
    }
}
