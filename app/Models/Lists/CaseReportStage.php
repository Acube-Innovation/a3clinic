<?php

namespace App\Models\Lists;

class CaseReportStage extends ListItem
{
    protected $table = 'case_report_stages';

    protected $casts = ['photos' => 'array'];
}
