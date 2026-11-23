<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A booking request from the public site. `id` and `created_at` are the string
 * values the booking form generates, not Laravel-managed columns.
 */
class Appointment extends Model
{
    public $timestamps = false;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected $casts = ['position' => 'integer'];

    public function files(): HasMany
    {
        return $this->hasMany(AppointmentFile::class, 'appointment_id')->orderBy('position');
    }
}
