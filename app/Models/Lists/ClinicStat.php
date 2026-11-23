<?php

namespace App\Models\Lists;

class ClinicStat extends ListItem
{
    protected $table = 'clinic_stats';

    protected $casts = ['value' => 'integer'];
}
