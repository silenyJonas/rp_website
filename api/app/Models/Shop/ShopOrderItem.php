<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShopOrderItem extends Model
{
    protected $table = 'shop_order_items';

    public $timestamps = false;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_variant_id',
        'product_name',
        'variant_name',
        'quantity',
        'unit_price',
        'total_price',
        'created_at',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'quantity' => 'integer',
        'created_at' => 'datetime',
    ];

    /**
     * Objednávka
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(ShopOrder::class, 'order_id');
    }

    /**
     * Produkt
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(ShopProduct::class, 'product_id');
    }

    /**
     * Varianta produktu
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ShopProductVariant::class, 'product_variant_id');
    }

    /**
     * Vrátí zobrazitelný název (s variantou pokud existuje)
     */
    public function getDisplayName(): string
    {
        if ($this->variant_name) {
            return "{$this->product_name} - {$this->variant_name}";
        }
        return $this->product_name;
    }

    
}