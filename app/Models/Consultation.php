<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Consultation page copy (prepare list lives in consultation_prepare). Always the single row with id 1. */
class Consultation extends Model
{
    public $timestamps = false;

    public $incrementing = false;

    protected $table = 'consultation';

    protected $guarded = [];

    public static function current(): ?self
    {
        return static::find(1);
    }
}
