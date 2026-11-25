<?php

namespace App\Mcp\Tools;

use App\Support\ContentEditor;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;

#[Name('create_record')]
#[Description('Create a new condition, product, blog post or patient case report (shown first in its list). The slug is made from the title. Fields use the same shape as get_content; "category" is required except for cases. Read an existing record first to copy its shape. CASES: "title" here is the case code (e.g. HF-2026-014, never the patient\'s name or initials); fields need "conditionSlug" and "title" (a headline). Cases are always created unpublished; publishing needs consentOnFile=true and consentDate after the clinic confirms signed consent. Photos: upload with watermark=1 first, then put paths in stages[].photos[].image.')]
class CreateRecord extends ConnectorTool
{
    public function handle(Request $request, ContentEditor $editor): Response
    {
        $args = $request->validate([
            'section' => 'required|string|in:conditions,products,posts,cases',
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
            'section' => $schema->string()->enum(['conditions', 'products', 'posts', 'cases'])->required(),
            'title' => $schema->string()->required()->description('Condition/product name, post title, or case code.'),
            'fields' => $schema->object()->required()->description('Other fields, e.g. {"category":"hair","summary":"…"}.'),
        ];
    }
}
