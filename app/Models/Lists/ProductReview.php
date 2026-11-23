<?php

namespace App\Models\Lists;

class ProductReview extends ListItem
{
    protected $table = 'product_reviews';

    protected $casts = ['rating' => 'integer'];
}
