<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\Appointments\AppointmentResource;
use App\Filament\Resources\Conditions\ConditionResource;
use App\Filament\Resources\Enquiries\EnquiryResource;
use App\Filament\Resources\Posts\PostResource;
use App\Filament\Resources\Products\ProductResource;
use App\Models\Appointment;
use App\Models\Enquiry;
use App\Support\SiteData;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

/** The old admin dashboard's figures: what needs attention, and what is live. */
class ClinicOverview extends StatsOverviewWidget
{
    protected ?string $pollingInterval = '60s';

    protected function getStats(): array
    {
        $data = app(SiteData::class);
        $pending = Appointment::where('status', 'pending')->count();
        $unread = Enquiry::where('read', false)->count();

        return [
            Stat::make('Pending appointments', $pending)
                ->description($pending ? 'Waiting for confirmation' : 'All caught up')
                ->color($pending ? 'warning' : 'success')
                ->url(AppointmentResource::getUrl()),
            Stat::make('Unread enquiries', $unread)
                ->color($unread ? 'warning' : 'success')
                ->url(EnquiryResource::getUrl()),
            Stat::make('Products live', count(array_filter($data->products(), fn ($p) => ! empty($p['inStock']))))
                ->url(ProductResource::getUrl()),
            Stat::make('Conditions published', count($data->conditions()))
                ->url(ConditionResource::getUrl()),
            Stat::make('Blog posts', count($data->posts()))
                ->url(PostResource::getUrl()),
        ];
    }
}
