<?php

namespace App\Models;

use App\Models\Lists\PostBlockItem;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * One body block of a post: a paragraph/heading/quote (`text`) or a `list`
 * whose entries live in post_block_items.
 */
class PostBlock extends Model
{
    public $timestamps = false;

    protected $guarded = [];

    public function items(): HasMany
    {
        return $this->hasMany(PostBlockItem::class, 'block_id')->orderBy('position');
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'post_slug');
    }
}
