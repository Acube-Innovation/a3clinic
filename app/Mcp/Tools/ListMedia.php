<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsReadOnly]
#[Name('list_media')]
#[Description('List recently uploaded media files (newest first) with their site paths and sizes.')]
class ListMedia extends ConnectorTool
{
    public function handle(Request $request): Response
    {
        $args = $request->validate([
            'type' => 'nullable|in:image,video',
            'limit' => 'nullable|integer|min:1|max:200',
        ]);
        $dirs = match ($args['type'] ?? null) {
            'image' => ['uploads'],
            'video' => ['uploads/videos'],
            default => ['uploads', 'uploads/videos'],
        };
        $files = [];
        foreach ($dirs as $dir) {
            foreach (glob(public_path($dir).'/*.*') ?: [] as $file) {
                if (is_file($file)) {
                    $files[] = ['path' => '/'.$dir.'/'.basename($file), 'bytes' => filesize($file), 'modified' => date('c', filemtime($file))];
                }
            }
        }
        usort($files, fn ($a, $b) => strcmp($b['modified'], $a['modified']));

        return Response::json(array_slice($files, 0, $args['limit'] ?? 30));
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'type' => $schema->string()->enum(['image', 'video']),
            'limit' => $schema->integer()->description('Default 30.'),
        ];
    }
}
