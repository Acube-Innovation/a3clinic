<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** One content write made through the Claude connector; `before` lets it be undone. */
class ContentChange extends Model
{
    public const UPDATED_AT = null;

    protected $guarded = [];

    protected $casts = ['before' => 'array', 'after' => 'array'];
}
