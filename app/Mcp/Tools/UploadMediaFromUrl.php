<?php

namespace App\Mcp\Tools;

use App\Support\MediaStore;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Http;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;

#[Name('upload_media_from_url')]
#[Description('Download an image (JPEG/PNG/WebP, ≤10 MB) or video (MP4/WebM, ≤30 MB) from a public https URL into the site uploads, and return its site path to use in content. For files on your own computer use the upload endpoint (POST /api/media) instead. Set watermark=true for patient before/after photos.')]
class UploadMediaFromUrl extends ConnectorTool
{
    public function handle(Request $request): Response
    {
        $args = $request->validate([
            'url' => 'required|url:https',
            'watermark' => 'nullable|boolean',
        ]);

        return $this->attempt(function () use ($args) {
            $tmp = tempnam(sys_get_temp_dir(), 'media');
            try {
                $response = Http::timeout(120)->withOptions(['sink' => $tmp])->get($args['url']);
                if (! $response->successful()) {
                    return Response::error("Download failed: HTTP {$response->status()}.");
                }
                $stored = MediaStore::store($tmp, (bool) ($args['watermark'] ?? false));

                return Response::json([...$stored, 'url' => self::siteUrl($stored['path'])]);
            } finally {
                @unlink($tmp);
            }
        });
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'url' => $schema->string()->required()->description('Public https URL of the image or video.'),
            'watermark' => $schema->boolean()->description('Bake the clinic watermark into a photo (before/after photos).'),
        ];
    }
}
