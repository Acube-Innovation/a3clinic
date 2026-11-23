<?php

namespace App\Models\Concerns;

/**
 * Content collections are keyed by a string `slug` (as in the Next.js app)
 * and carry no Laravel timestamps.
 */
trait SlugKeyed
{
    public function initializeSlugKeyed(): void
    {
        $this->primaryKey = 'slug';
        $this->keyType = 'string';
        $this->incrementing = false;
        $this->timestamps = false;
        $this->guarded = [];
    }
}
