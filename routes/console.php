<?php

use Illuminate\Support\Facades\Schedule;

// Run by cron every minute: `cd ~/a3clinic && php artisan schedule:run` (deploy/README.md).
Schedule::command('site:backup')->dailyAt('02:30')->timezone('Asia/Kolkata');
Schedule::command('site:backup --uploads')->weeklyOn(0, '03:00')->timezone('Asia/Kolkata');
