<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ShopProductVariant extends Model
{
    use SoftDeletes;

    protected $table = 'shop_product_variants';

    protected $fillable = [
        'product_id', 'variant_name', 'attribute_1_name', 'attribute_1_value',
        'attribute_2_name', 'attribute_2_value', 'sku_variant',
        'price_with_vat', 'price_without_vat', 'vat_rate', 'stock_quantity',
    ];

    protected $casts = [
        'price_with_vat' => 'decimal:2',
        'price_without_vat' => 'decimal:2',
        'vat_rate' => 'decimal:2',
        'stock_quantity' => 'integer',
    ];

    protected static function booted()
    {
        // Spustí se při $variant->save() nebo $variant->update()
        static::saved(function ($variant) {
            $variant->syncParentStock();
        });

        // Spustí se při $variant->delete()
        static::deleted(function ($variant) {
            $variant->syncParentStock();
        });

        static::deleting(function ($variant) {
            foreach ($variant->images as $image) {
                if (Storage::disk('public')->exists('products/' . $image->image_path)) {
                    Storage::disk('public')->delete('products/' . $image->image_path);
                }
                $image->delete();
            }
        });
    }

    /**
     * Provede synchronizaci skladu pro konkrétní produktové ID
     * Tato metoda je STATICKÁ, takže ji můžeš volat odkudkoliv i bez instance varianty
     */
    public static function forceSyncParentStock(int $productId): void
    {
        $totalStock = self::where('product_id', $productId)
            ->whereNull('deleted_at') // Pouze nesmazané varianty
            ->sum('stock_quantity');

        DB::table('shop_products')
            ->where('id', $productId)
            ->update(['stock_quantity' => $totalStock]);
            
        \Illuminate\Support\Facades\Log::info("Manual stock sync performed", [
            'product_id' => $productId, 
            'total_stock' => $totalStock
        ]);
    }

    /**
     * Pomocná metoda pro instanci varianty
     */
    public function syncParentStock(): void
    {
        if ($this->product_id) {
            self::forceSyncParentStock($this->product_id);
        }
    }

    public function product(): BelongsTo { return $this->belongsTo(ShopProduct::class, 'product_id'); }
    public function images(): HasMany { return $this->hasMany(ShopProductImage::class, 'variant_id'); }
}