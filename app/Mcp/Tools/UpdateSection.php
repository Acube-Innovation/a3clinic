<?php

namespace App\Mcp\Tools;

use App\Support\ContentEditor;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;

#[Name('update_section')]
#[Description(<<<'TXT'
Save a whole-page section. Live immediately; undo with revert_change.
List sections (testimonials, faqs, gallery, videos): send "items" = the COMPLETE new list (get_content first, then add/edit/remove/reorder). Anything left out is deleted.
  gallery item: {"image":"/uploads/…","label":"…"}; videos item (home page video section): {"title":"…","video":"<YouTube link or /uploads/videos/….mp4>"}.
Object sections (doctor, clinic, consultation): send "fields" = only the top-level keys to change; other keys are kept.
TXT)]
class UpdateSection extends ConnectorTool
{
    public function handle(Request $request, ContentEditor $editor): Response
    {
        $args = $request->validate([
            'section' => 'required|string|in:'.implode(',', [...ContentEditor::LIST_SECTIONS, ...ContentEditor::OBJECT_SECTIONS]),
            'items' => 'nullable|array',
            'fields' => 'nullable|array',
        ]);
        $isList = in_array($args['section'], ContentEditor::LIST_SECTIONS, true);
        $data = $isList ? ($args['items'] ?? null) : ($args['fields'] ?? null);
        if ($data === null) {
            return Response::error($isList ? "Send \"items\" (the full list) for {$args['section']}." : "Send \"fields\" for {$args['section']}.");
        }

        return $this->attempt(fn () => Response::json(
            $editor->updateSection($args['section'], $data, $this->actor($request))
        ));
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'section' => $schema->string()->enum([...ContentEditor::LIST_SECTIONS, ...ContentEditor::OBJECT_SECTIONS])->required(),
            'items' => $schema->array()->items($schema->object())->description('List sections: the complete new list.'),
            'fields' => $schema->object()->description('Object sections: the keys to change.'),
        ];
    }
}
