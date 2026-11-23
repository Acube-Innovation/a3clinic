<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Clinic contact details (hours/stats live in clinic_* tables). Always the single row with id 1. */
class Clinic extends Model
{
    public $timestamps = false;

    public $incrementing = false;

    protected $table = 'clinic';

    protected $guarded = [];

    public static function current(): ?self
    {
        return static::find(1);
    }
}
