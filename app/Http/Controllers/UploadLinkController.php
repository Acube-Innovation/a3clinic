<?php

namespace App\Http\Controllers;

use App\Models\UploadLink;
use App\Support\MediaStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use InvalidArgumentException;

/** The signed upload page behind the connector's create_upload_link tool. */
class UploadLinkController extends Controller
{
    public function show(UploadLink $link): View
    {
        return view('connector.upload', ['link' => $link]);
    }

    public function store(Request $request, UploadLink $link): JsonResponse
    {
        if (! $link->isOpen()) {
            return response()->json(['message' => 'This upload link has expired or is full. Ask Claude for a new one.'], 410);
        }

        $request->validate(['file' => 'required|file|max:'.(MediaStore::MAX_VIDEO_BYTES / 1024)]);
        $file = $request->file('file');

        try {
            $stored = MediaStore::store($file->getRealPath(), $link->watermark && str_starts_with(MediaStore::mime($file->getRealPath()), 'image/'));
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $link->addFile($stored, mb_substr($file->getClientOriginalName(), 0, 120));

        return response()->json([...$stored, 'name' => $file->getClientOriginalName()], 201);
    }
}
