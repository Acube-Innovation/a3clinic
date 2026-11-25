<?php

namespace App\Mcp\Tools;

use App\Models\ContentChange;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsReadOnly]
#[Name('list_changes')]
#[Description('Recent content changes made through this connector (newest first), with ids for revert_change.')]
class ListChanges extends ConnectorTool
{
    public function handle(Request $request): Response
    {
        $limit = (int) ($request->get('limit') ?: 20);

        return Response::json(ContentChange::latest('id')->limit(min($limit, 100))->get()
            ->map(fn (ContentChange $c) => [
                'id' => $c->id,
                'when' => $c->created_at?->toIso8601String(),
                'section' => $c->section,
                'slug' => $c->slug,
                'action' => $c->action,
                'by' => $c->actor,
            ])->all());
    }

    public function schema(JsonSchema $schema): array
    {
        return ['limit' => $schema->integer()->description('Default 20.')];
    }
}
