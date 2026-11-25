<?php

namespace App\Mcp\Tools;

use App\Models\UploadLink;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;

#[Name('create_upload_link')]
#[Description(<<<'TXT'
Create a one-time upload page (valid 30 minutes) where the user can upload photos and videos from their phone or computer. Use this whenever the user wants to add their own files and you cannot send the file yourself — e.g. in claude.ai / Claude desktop / mobile, where files attached to the chat can NOT be passed to this website.
Give the user the link, ask them to upload and tell you when done, then call get_uploads with the returned id to get the stored paths, and place them with update_record / update_section.
Set watermark=true for patient before/after photos.
TXT)]
class CreateUploadLink extends ConnectorTool
{
    public function handle(Request $request): Response
    {
        $args = $request->validate([
            'purpose' => 'nullable|string|max:191',
            'watermark' => 'nullable|boolean',
        ]);

        $link = UploadLink::create([
            'user_id' => $request->user()?->getAuthIdentifier(),
            'purpose' => $args['purpose'] ?? null,
            'watermark' => (bool) ($args['watermark'] ?? false),
            'expires_at' => now()->addMinutes(UploadLink::LIFETIME_MINUTES),
        ]);

        return Response::json([
            'id' => $link->id,
            'url' => $link->url(),
            'expiresInMinutes' => UploadLink::LIFETIME_MINUTES,
            'instructions' => 'Send the user this link. When they say they are done, call get_uploads with this id.',
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'purpose' => $schema->string()->description('Shown on the upload page, e.g. "Home page clinic tour video".'),
            'watermark' => $schema->boolean()->description('Watermark uploaded photos (patient before/after photos).'),
        ];
    }
}
