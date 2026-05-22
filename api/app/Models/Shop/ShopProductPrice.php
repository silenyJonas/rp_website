<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShopProductPrice extends Model
{
    protected $table = 'shop_product_prices';

    protected $fillable = [
        'product_id',
        'variant_id',
        'vat_rate',
        'price_czk_without_vat',
        'price_czk_with_vat',
        'price_eur_without_vat',
        'price_eur_with_vat',
        'price_usd_without_vat',
        'price_usd_with_vat',
    ];

    protected $casts = [
        'vat_rate' => 'decimal:2',
        'price_czk_without_vat' => 'decimal:2',
        'price_czk_with_vat' => 'decimal:2',
        'price_eur_without_vat' => 'decimal:2',
        'price_eur_with_vat' => 'decimal:2',
        'price_usd_without_vat' => 'decimal:2',
        'price_usd_with_vat' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(ShopProduct::class, 'product_id');
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ShopProductVariant::class, 'variant_id');
    }
}