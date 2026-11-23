<?php

namespace App\Models;

use App\Models\Concerns\SlugKeyed;
use App\Models\Lists\ConditionCause;
use App\Models\Lists\ConditionExpectedResult;
use App\Models\Lists\ConditionFaq;
use App\Models\Lists\ConditionResult;
use App\Models\Lists\ConditionSymptom;
use App\Models\Lists\ConditionTreatment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A treatable condition (hair, skin, chronic…) with its detail-page lists. */
class Condition extends Model
{
    use SlugKeyed;

    protected $casts = ['featured' => 'boolean', 'position' => 'integer'];

    public function symptoms(): HasMany
    {
        return $this->hasMany(ConditionSymptom::class, 'condition_slug')->orderBy('position');
    }

    public function causes(): HasMany
    {
        return $this->hasMany(ConditionCause::class, 'condition_slug')->orderBy('position');
    }

    public function treatment(): HasMany
    {
        return $this->hasMany(ConditionTreatment::class, 'condition_slug')->orderBy('position');
    }

    public function expectedResults(): HasMany
    {
        return $this->hasMany(ConditionExpectedResult::class, 'condition_slug')->orderBy('position');
    }

    public function faqs(): HasMany
    {
        return $this->hasMany(ConditionFaq::class, 'condition_slug')->orderBy('position');
    }

    public function results(): HasMany
    {
        return $this->hasMany(ConditionResult::class, 'condition_slug')->orderBy('position');
    }
}
