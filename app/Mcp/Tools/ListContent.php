<?php

namespace App\Mcp\Tools;

use App\Support\ContentEditor;
use App\Support\ContentStore;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsReadOnly]
#[Name('list_content')]
#[Description('Overview of the editable website content: each section, and the slug + title of every condition, product and blog post (with the public page URL). Start here.')]
class ListContent extends ConnectorTool
{
    public function handle(Request $request, ContentStore $store): Response
    {
        $paths = ['conditions' => '/en/conditions/', 'products' => '/en/shop/', 'posts' => '/en/blog/', 'cases' => '/en/results/'];
        $out = [];
        foreach (array_keys(ContentEditor::RECORD_FIELDS) as $section) {
            $out[$section] = collect($store->read($section))->map(fn ($r) => [
                'slug' => $r['slug'],
                'title' => $r['title'] ?? $r['name'] ?? '',
                'category' => $r['category'] ?? null,
                'url' => self::siteUrl($paths[$section].$r['slug']),
            ])->all();
        }
        foreach ([...ContentEditor::LIST_SECTIONS, ...ContentEditor::OBJECT_SECTIONS] as $section) {
            $data = $store->read($section);
            $out[$section] = array_is_list($data) ? count($data).' items (list: update_section replaces the whole list)' : 'object with keys: '.implode(', ', array_keys($data));
        }

        return Response::json($out);
    }
}
