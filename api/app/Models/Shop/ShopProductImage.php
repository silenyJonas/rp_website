<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShopProductImage extends Model
{
    use SoftDeletes;

    protected $table = 'shop_product_images';

    public $timestamps = false;

    protected $fillable = [
        'product_id',
        'variant_id',
        'image_path',
        'alt_text',
        'is_primary',
        'sort_order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'sort_order' => 'integer',
        'created_at' => 'datetime',
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
     * Varianta (pokud je obrázek specificky k variantě)
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ShopProductVariant::class, 'variant_id');
    }

    /**
     * Vrátí úplnou URL obrázku
     */
    public function getUrl(): string
    {
        return asset('storage/products/' . $this->image_path);
    }

    /**
     * Vrátí cestu k obrázku na disku
     */
    public function getFullPath(): string
    {
        return storage_path('app/public/products/' . $this->image_path);
    }

    /**
     * Scope pro primární obrázky produktu (ne varianty)
     */
    public function scopePrimary($query)
    {
        return $query->where('is_primary', true)->whereNull('variant_id');
    }

    /**
     * Scope pro obrázky specifické produktu (bez variant)
     */
    public function scopeProductImages($query)
    {
        return $query->whereNull('variant_id');
    }

    /**
     * Scope pro obrázky specifické variantě
     */
    public function scopeVariantImages($query, $variantId)
    {
        return $query->where('variant_id', $variantId);
    }
}