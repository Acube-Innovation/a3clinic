<?php

namespace App\Mcp\Tools;

use App\Support\ContentEditor;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;

#[Name('update_record')]
#[Description(<<<'TXT'
Change fields of one condition, product or blog post. Only the fields you send change; the rest are kept. The change is live immediately and can be undone with revert_change.
Images: send a site path such as "/uploads/<file>.jpg" (upload first with the media upload endpoint or upload_media_from_url); "" removes it.
Video ("video" on conditions/products, or a {"type":"video","text":...} block in a post body): a YouTube link or "/uploads/videos/<file>.mp4"; "" removes it.
List fields (symptoms, faqs, body, results…) are replaced whole, so send the complete list. Prices are in paise (₹450 = 45000).
Condition before/after photos ("results") should be uploaded with watermark=true.
TXT)]
class UpdateRecord extends ConnectorTool
{
    public function handle(Request $request, ContentEditor $editor): Response
    {
        $args = $request->validate([
            'section' => 'required|string|in:conditions,products,posts',
            'slug' => 'required|string',
            'fields' => 'required|array|min:1',
        ]);

        return $this->attempt(fn () => Response::json(
            $editor->updateRecord($args['section'], $args['slug'], $args['fields'], $this->actor($request))
        ));
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'section' => $schema->string()->enum(['conditions', 'products', 'posts'])->required(),
            'slug' => $schema->string()->required(),
            'fields' => $schema->object()->required()->description('Fields to change, in the shape get_content returns (camelCase).'),
        ];
    }
}
