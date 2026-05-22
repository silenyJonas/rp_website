<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

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
        'sku',
        'stock_quantity',
        'stock_warning_level',
        'is_active',
        'is_featured',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'stock_quantity' => 'integer',
        'stock_warning_level' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Ceny hlavního produktu (kde variant_id je null)
     */
    public function prices(): HasOne
    {
        return $this->hasOne(ShopProductPrice::class, 'product_id')->whereNull('variant_id');
    }

    /**
     * Kategorie produktu
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ShopCategory::class, 'category_id');
    }

    /**
     * Dodavatel
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(ShopSupplier::class, 'supplier_id');
    }

    /**
     * Obrázky produktu
     */
    public function images(): HasMany
    {
        return $this->hasMany(ShopProductImage::class, 'product_id');
    }

    /**
     * Primární obrázek (galerie)
     */
    public function primaryImage()
    {
        return $this->hasOne(ShopProductImage::class, 'product_id')->where('is_primary', true)->orderBy('sort_order');
    }

    /**
     * Varianty produktu
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ShopProductVariant::class, 'product_id');
    }

    /**
     * Recenze
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(ShopReview::class, 'product_id');
    }

    /**
     * Položky objednávek
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(ShopOrderItem::class, 'product_id');
    }

    /**
     * Scope pro aktivní produkty
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope pro vybrané produkty
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope pro nízké skladové zásoby
     */
    public function scopeLowStock($query)
    {
        return $query->whereRaw('stock_quantity <= stock_warning_level');
    }

    /**
     * Vrátí URL primárního obrázku
     */
    public function getPrimaryImageUrl(): ?string
    {
        return $this->primaryImage?->getUrl() ?? null;
    }

    /**
     * Vrátí všechny obrázky seřazené
     */
    public function getOrderedImages()
    {
        return $this->images()->orderBy('sort_order')->get();
    }
}