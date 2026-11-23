<?php

namespace App\Models;

use App\Models\Concerns\SlugKeyed;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A blog post; its body is an ordered list of blocks. */
class Post extends Model
{
    use SlugKeyed;

    protected $casts = ['reading_minutes' => 'integer', 'featured' => 'boolean', 'position' => 'integer'];

    public function blocks(): HasMany
    {
        return $this->hasMany(PostBlock::class, 'post_slug')->orderBy('position');
    }
}
