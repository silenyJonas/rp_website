<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShopProduct extends Model
{
    use SoftDeletes;

    protected $table = 'shop_products';

    protected $fillable = [
        'category_id',
        'supplier_id',
        'name',
        'slug',
        'description',
        'short_description',
        'price',
        'cost_price',
        'sku',
        'stock_quantity',
        'stock_warning_level',
        'is_active',
        'is_featured',
    ];

    protected $casts = [
        'price' => 'float',
        'cost_price' => 'float',
        'stock_quantity' => 'integer',
        'stock_warning_level' => 'integer',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'category_id' => 'integer',
        'supplier_id' => 'integer',
    ];

    /**
     * Relace na kategorii, do které produkt patří.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ShopCategory::class, 'category_id');
    }
}