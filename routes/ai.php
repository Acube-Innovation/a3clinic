<?php

use App\Mcp\Servers\SiteServer;
use Laravel\Mcp\Facades\Mcp;

// The Claude connector (see deploy/README.md → "Claude connector").
// OAuth discovery + client registration, so claude.ai can add the site as a
// custom connector (people sign in with their /admin account).
Mcp::oauthRoutes();

Mcp::web('/mcp', SiteServer::class)->middleware(['auth:api', 'throttle:120,1']);
