<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** A file a patient attached to a booking request. */
class AppointmentFile extends Model
{
    public $timestamps = false;

    protected $guarded = [];
}
