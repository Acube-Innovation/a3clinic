<?php

use App\Http\Controllers\Api\MediaController;
use Illuminate\Support\Facades\Route;

// Claude connector: local file uploads (the MCP endpoint is in routes/ai.php).
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::post('media', [MediaController::class, 'store']);
});
