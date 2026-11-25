<?php

namespace App\Mcp\Tools;

use App\Models\UploadLink;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsReadOnly]
#[Name('get_uploads')]
#[Description('Files the user has uploaded through an upload link (from create_upload_link): original name, site path, type and size. Use the paths in update_record / update_section.')]
class GetUploads extends ConnectorTool
{
    public function handle(Request $request): Response
    {
        $args = $request->validate(['id' => 'required|string']);
        $link = UploadLink::find($args['id']);
        if (! $link) {
            return Response::error('No upload link with that id.');
        }

        $files = $link->files ?? [];

        return Response::json([
            'files' => $files,
            'count' => count($files),
            'linkOpen' => $link->isOpen(),
            'note' => $files === [] ? 'Nothing uploaded yet. Ask the user to finish uploading on the page, then check again.' : null,
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return ['id' => $schema->string()->required()->description('The id returned by create_upload_link.')];
    }
}
