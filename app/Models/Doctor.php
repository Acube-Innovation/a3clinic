<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Doctor profile text (lists live in the doctor_* tables). Always the single row with id 1. */
class Doctor extends Model
{
    public $timestamps = false;

    public $incrementing = false;

    protected $table = 'doctor';

    protected $guarded = [];

    public static function current(): ?self
    {
        return static::find(1);
    }
}
