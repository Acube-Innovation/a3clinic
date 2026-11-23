<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * A patient testimonial. Seed records carry `rec_id` (t1, t2…), admin-created
 * ones `slug`; both are preserved as the source data had them.
 */
class Testimonial extends Model
{
    public $timestamps = false;

    protected $guarded = [];

    protected $casts = ['consent_on_file' => 'boolean', 'position' => 'integer'];
}
