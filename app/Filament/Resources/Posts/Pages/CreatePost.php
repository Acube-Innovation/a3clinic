<?php

namespace App\Filament\Resources\Posts\Pages;

use App\Filament\Resources\Posts\PostResource;
use App\Filament\Support\CreatesContentRecord;
use Filament\Resources\Pages\CreateRecord;

class CreatePost extends CreateRecord
{
    use CreatesContentRecord;

    protected static string $resource = PostResource::class;

    protected static function section(): string
    {
        return 'posts';
    }

    protected static function titleField(): string
    {
        return 'title';
    }
}
