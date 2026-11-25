<?php

use App\Mcp\Servers\SiteServer;
use Laravel\Mcp\Facades\Mcp;

// The Claude connector (see deploy/README.md → "Claude connector").
Mcp::web('/mcp', SiteServer::class)->middleware(['auth:sanctum', 'throttle:120,1']);
