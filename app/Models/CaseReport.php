<?php

namespace App\Models;

use App\Models\Concerns\SlugKeyed;
use App\Models\Lists\CaseReportApproach;
use App\Models\Lists\CaseReportStage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** An anonymised patient case report with its photo timeline (/results). */
class CaseReport extends Model
{
    use SlugKeyed;

    protected $casts = [
        'consent_on_file' => 'boolean',
        'published' => 'boolean',
        'featured' => 'boolean',
        'sample' => 'boolean',
        'noindex' => 'boolean',
        'position' => 'integer',
    ];

    public function condition(): BelongsTo
    {
        return $this->belongsTo(Condition::class, 'condition_slug');
    }

    public function approach(): HasMany
    {
        return $this->hasMany(CaseReportApproach::class, 'case_slug')->orderBy('position');
    }

    public function stages(): HasMany
    {
        return $this->hasMany(CaseReportStage::class, 'case_slug')->orderBy('position');
    }
}
