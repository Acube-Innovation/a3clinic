<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\MediaStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

/** POST /api/media — upload a local image or video for the Claude connector. */
class MediaController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:'.(MediaStore::MAX_VIDEO_BYTES / 1024),
            'watermark' => 'nullable|boolean',
        ]);

        try {
            $stored = MediaStore::store($request->file('file')->getRealPath(), $request->boolean('watermark'));
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([...$stored, 'url' => rtrim(config('app.url'), '/').$stored['path']], 201);
    }
}
