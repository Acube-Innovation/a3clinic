<?php

namespace App\Models\Lists;

use Illuminate\Database\Eloquent\Model;

/**
 * An ordered row in one of the content child tables (symptoms, FAQs, doctor
 * timeline…). Every such table has an auto-increment id and a `position`.
 */
abstract class ListItem extends Model
{
    public $timestamps = false;

    protected $guarded = [];
}
