<?php

namespace App\Mcp\Tools;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

/** Shared helpers for the site connector's tools. */
abstract class ConnectorTool extends Tool
{
    /** Who made a change: the connector token's name. */
    protected function actor(Request $request): ?string
    {
        $user = $request->user();
        $token = $user?->currentAccessToken();

        return $token?->name ? "connector:{$token->name}" : ($user?->email ?? null);
    }

    /** Run $fn, turning validation problems into a tool error Claude can read and fix. */
    protected function attempt(\Closure $fn): Response
    {
        try {
            return $fn();
        } catch (\InvalidArgumentException|ModelNotFoundException $e) {
            return Response::error($e->getMessage());
        }
    }

    protected static function siteUrl(string $path = ''): string
    {
        return rtrim(config('app.url'), '/').$path;
    }
}
