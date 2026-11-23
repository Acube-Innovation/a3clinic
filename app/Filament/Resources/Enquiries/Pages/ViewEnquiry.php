<?php

namespace App\Filament\Resources\Enquiries\Pages;

use App\Filament\Resources\Enquiries\EnquiryResource;
use Filament\Resources\Pages\ViewRecord;

class ViewEnquiry extends ViewRecord
{
    protected static string $resource = EnquiryResource::class;

    /** Opening an enquiry marks it read, as reading it in the old inbox did. */
    public function mount(int|string $record): void
    {
        parent::mount($record);

        if (! $this->record->read) {
            $this->record->update(['read' => true]);
        }
    }
}
