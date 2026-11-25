<?php

namespace App\Mcp\Tools;

use App\Support\ContentEditor;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;

#[Name('create_record')]
#[Description('Create a new condition, product or blog post (shown first in its list, live immediately). The slug is made from the title. Fields use the same shape as get_content; "category" is required. Read an existing record first to copy its shape.')]
class CreateRecord extends ConnectorTool
{
    public function handle(Request $request, ContentEditor $editor): Response
    {
        $args = $request->validate([
            'section' => 'required|string|in:conditions,products,posts',
            'title' => 'required|string|max:191',
            'fields' => 'required|array',
        ]);

        return $this->attempt(fn () => Response::json(
            $editor->createRecord($args['section'], $args['title'], $args['fields'], $this->actor($request))
        ));
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'section' => $schema->string()->enum(['conditions', 'products', 'posts'])->required(),
            'title' => $schema->string()->required()->description('Condition/product name or post title.'),
            'fields' => $schema->object()->required()->description('Other fields, e.g. {"category":"hair","summary":"…"}.'),
        ];
    }
}
