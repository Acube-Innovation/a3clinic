<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** A message from the contact form. */
class Enquiry extends Model
{
    public $timestamps = false;

    public $incrementing = false;

    protected $table = 'enquiries';

    protected $keyType = 'string';

    protected $guarded = [];

    protected $casts = ['read' => 'boolean', 'position' => 'integer'];
}
