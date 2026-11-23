<?php

namespace App\Models;

use App\Models\Concerns\SlugKeyed;
use App\Models\Lists\ProductBenefit;
use App\Models\Lists\ProductDirection;
use App\Models\Lists\ProductIngredient;
use App\Models\Lists\ProductRelated;
use App\Models\Lists\ProductReview;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A shop product. Prices are stored in paise. */
class Product extends Model
{
    use SlugKeyed;

    protected $casts = [
        'price' => 'integer',
        'compare_at_price' => 'integer',
        'in_stock' => 'boolean',
        'featured' => 'boolean',
        'bestseller' => 'boolean',
        'rating_value' => 'float',
        'rating_count' => 'integer',
        'position' => 'integer',
    ];

    public function benefits(): HasMany
    {
        return $this->hasMany(ProductBenefit::class, 'product_slug')->orderBy('position');
    }

    public function ingredients(): HasMany
    {
        return $this->hasMany(ProductIngredient::class, 'product_slug')->orderBy('position');
    }

    public function directions(): HasMany
    {
        return $this->hasMany(ProductDirection::class, 'product_slug')->orderBy('position');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class, 'product_slug')->orderBy('position');
    }

    public function related(): HasMany
    {
        return $this->hasMany(ProductRelated::class, 'product_slug')->orderBy('position');
    }
}
