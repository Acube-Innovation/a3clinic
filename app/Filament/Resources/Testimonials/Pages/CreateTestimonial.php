<?php

namespace App\Filament\Resources\Testimonials\Pages;

use App\Filament\Resources\Testimonials\TestimonialResource;
use App\Models\Section;
use App\Models\Testimonial;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateTestimonial extends CreateRecord
{
    protected static string $resource = TestimonialResource::class;

    /** Newest first with a slug identity, as admin-created testimonials had before. */
    protected function handleRecordCreation(array $data): Model
    {
        return DB::transaction(function () use ($data) {
            Testimonial::query()->increment('position');
            $testimonial = Testimonial::create([...$data, 'slug' => Str::slug($data['author']).'-'.Str::lower(Str::random(4)), 'position' => 0]);
            Section::markInitialized('testimonials');

            return $testimonial;
        });
    }
}
