<?php

namespace App\Support;

/**
 * Every content table carried over from the Next.js app, parents before
 * children (see the create_content_tables migration).
 */
final class ContentTables
{
    public const ALL = [
        'sections',
        'conditions', 'condition_symptoms', 'condition_causes', 'condition_treatment',
        'condition_expected_results', 'condition_faqs', 'condition_results',
        'products', 'product_benefits', 'product_directions', 'product_related',
        'product_ingredients', 'product_reviews',
        'posts', 'post_blocks', 'post_block_items',
        'testimonials', 'homepage_faqs', 'gallery_items',
        'doctor', 'doctor_bio_paragraphs', 'doctor_values', 'doctor_education',
        'doctor_timeline', 'doctor_achievements', 'doctor_gallery',
        'clinic', 'clinic_hours', 'clinic_stats',
        'consultation', 'consultation_prepare',
        'appointments', 'appointment_files', 'enquiries',
    ];
}
