<?php

namespace App\Support;

use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\Geometry\Factories\CircleFactory;
use Intervention\Image\Geometry\Factories\RectangleFactory;
use Intervention\Image\ImageManager;
use Intervention\Image\Typography\FontFactory;

/**
 * Before/after photos get the clinic watermark BAKED INTO THE PIXELS at upload
 * time (port of applyWatermark in src/lib/admin/upload.ts). A CSS overlay can
 * be stripped in seconds; a composited watermark survives every download.
 *
 * Tiled diagonal clinic name plus a solid credit chip, drawn with GD.
 */
class Watermark
{
    private const TEXT = "Dr. Riji's Health Care";

    private const MAX_WIDTH = 1600;

    /** Watermark the image at $source and write it as public/uploads/<uuid>.jpg; returns "uploads/<uuid>.jpg". */
    public static function store(string $source): string
    {
        $path = 'uploads/'.Str::uuid().'.jpg';
        file_put_contents(public_path($path), self::apply(file_get_contents($source)));

        return $path;
    }

    /** @return string JPEG bytes */
    public static function apply(string $bytes): string
    {
        $image = ImageManager::usingDriver(GdDriver::class)->decodeBinary($bytes)
            ->orient()                       // respect EXIF orientation
            ->scaleDown(width: self::MAX_WIDTH); // result photos never need more on the web

        $w = $image->width();
        $h = $image->height();
        $font = resource_path('fonts/DejaVuSans-Bold.ttf');

        // Tile the text on a plane rotated -30° about the centre, covering it
        // generously so the tilt leaves no gaps (same grid as the SVG version).
        $angle = deg2rad(-30);
        [$cx, $cy] = [$w / 2, $h / 2];
        for ($y = -$h; $y < $h * 2; $y += 180) {
            for ($x = -$w; $x < $w * 2; $x += 420) {
                $px = $cx + ($x - $cx) * cos($angle) - ($y - $cy) * sin($angle);
                $py = $cy + ($x - $cx) * sin($angle) + ($y - $cy) * cos($angle);
                if ($px < -500 || $px > $w + 500 || $py < -300 || $py > $h + 300) {
                    continue;
                }
                // GD can't stroke translucent text, so a 1px teal offset stands in
                // for the faint outline that keeps the text legible on white.
                foreach ([[1, 'rgba(4, 75, 77, 0.10)'], [0, 'rgba(255, 255, 255, 0.16)']] as [$offset, $color]) {
                    $image->text(self::TEXT, (int) $px + $offset, (int) $py + $offset, function (FontFactory $f) use ($font, $color) {
                        $f->filename($font);
                        $f->size(21);
                        $f->color($color);
                        $f->angle(30);
                    });
                }
            }
        }

        // Credit chip, bottom right: a 256×34 pill with the copyright line.
        [$chipX, $chipY] = [$w - 268, $h - 46];
        $chip = 'rgba(2, 38, 40, 0.72)';
        $image->drawRectangle(function (RectangleFactory $r) use ($chipX, $chipY, $chip) {
            $r->at($chipX + 17, $chipY);
            $r->size(256 - 34, 34);
            $r->background($chip);
        });
        foreach ([$chipX + 17, $chipX + 256 - 17] as $capX) {
            $image->drawCircle(function (CircleFactory $c) use ($capX, $chipY, $chip) {
                $c->at($capX, $chipY + 17);
                $c->radius(17);
                $c->background($chip);
            });
        }
        $image->text('© '.self::TEXT, $chipX + 128, $chipY + 17, function (FontFactory $f) use ($font) {
            $f->filename($font);
            $f->size(11);
            $f->color('rgba(255, 255, 255, 0.95)');
            $f->align('center', 'center');
        });

        return (string) $image->encode(new JpegEncoder(quality: 82, progressive: true));
    }
}
