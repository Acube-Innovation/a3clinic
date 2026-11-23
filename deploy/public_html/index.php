<?php

/*
 * Front controller for the GoDaddy host. The web root is ~/public_html and
 * the application lives outside it in ~/a3clinic (deploy/README.md).
 */

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

$app = dirname(__DIR__).'/a3clinic';

if (file_exists($maintenance = $app.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $app.'/vendor/autoload.php';

(require_once $app.'/bootstrap/app.php')
    ->handleRequest(Request::capture());
