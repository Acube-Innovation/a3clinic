<?php

namespace App\Mcp\Tools;

use App\Support\ContentEditor;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;

#[Name('revert_change')]
#[Description('Undo a connector change: puts that section or record back exactly as it was before change <id> (see list_changes). Undoing a create removes the record. The revert is itself logged and can be reverted.')]
class RevertChange extends ConnectorTool
{
    public function handle(Request $request, ContentEditor $editor): Response
    {
        $args = $request->validate(['id' => 'required|integer']);

        return $this->attempt(function () use ($editor, $args, $request) {
            $change = $editor->revert($args['id'], $this->actor($request));

            return Response::text("Reverted change #{$args['id']} ({$change->section}".($change->slug ? "/{$change->slug}" : '').'). This revert is change #'.$change->id.'.');
        });
    }

    public function schema(JsonSchema $schema): array
    {
        return ['id' => $schema->integer()->required()];
    }
}
