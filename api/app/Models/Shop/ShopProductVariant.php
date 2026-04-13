<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'price_with_vat',      // Cena S DPH
        'price_without_vat',   // Cena BEZ DPH
        'vat_rate',             // DPH sazba (%)
        'stock_quantity',
    ];

    protected $casts = [
        'price_with_vat' => 'decimal:2',
        'price_without_vat' => 'decimal:2',
        'vat_rate' => 'decimal:2',
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
     * Obrázky specifické této variantě
     */
    public function images(): HasMany
    {
        return $this->hasMany(ShopProductImage::class, 'variant_id');
    }

    /**
     * Vrátí finalní cenu S DPH
     */
    public function getPriceWithVAT(): float
    {
        return (float)$this->price_with_vat;
    }

    /**
     * Vrátí cenu BEZ DPH
     */
    public function getPriceWithoutVAT(): float
    {
        return (float)$this->price_without_vat;
    }

    /**
     * Vrátí DPH sazbu
     */
    public function getVATRate(): float
    {
        return (float)$this->vat_rate;
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