<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShopProductVariant extends Model
{
    use SoftDeletes;

    protected $table = 'shop_product_variants';

    protected $fillable = [
        'product_id',
        'variant_name',
        'attribute_1_name',
        'attribute_1_value',
        'attribute_2_name',
        'attribute_2_value',
        'sku_variant',
        'price_modifier',
        'stock_quantity',
    ];

    protected $casts = [
        'price_modifier' => 'decimal:2',
        'stock_quantity' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Produkt
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(ShopProduct::class, 'product_id');
    }

    /**
     * Vrátí finalní cenu s modifikátorem
     */
    public function getFinalPrice(float $basePrice): float
    {
        return $basePrice + $this->price_modifier;
    }

    /**
     * Scope pro dostupné varianty (na skladě)
     */
    public function scopeAvailable($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }

    /**
     * Scope pro nízké zásoby
     */
    public function scopeLowStock($query, int $threshold = 10)
    {
        return $query->whereBetween('stock_quantity', [1, $threshold]);
    }
}