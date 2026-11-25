<?php

namespace App\Mcp\Tools;

use App\Support\ContentEditor;
use App\Support\ContentStore;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsReadOnly]
#[Name('get_content')]
#[Description('Read website content exactly as the site uses it. With a slug, returns one condition/product/post; without, the whole section. Always read before editing.')]
class GetContent extends ConnectorTool
{
    public function handle(Request $request, ContentStore $store): Response
    {
        $args = $request->validate([
            'section' => 'required|string|in:'.implode(',', ContentEditor::editableSections()),
            'slug' => 'nullable|string',
        ]);

        return $this->attempt(function () use ($store, $args) {
            if (! empty($args['slug'])) {
                $record = $store->record($args['section'], $args['slug']);

                return $record ? Response::json($record) : Response::error("No {$args['section']} record with slug \"{$args['slug']}\". Use list_content.");
            }

            return Response::json($store->read($args['section']));
        });
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'section' => $schema->string()->enum(ContentEditor::editableSections())->required(),
            'slug' => $schema->string()->description('For conditions, products, posts: the record slug.'),
        ];
    }
}
