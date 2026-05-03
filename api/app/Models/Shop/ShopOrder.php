<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShopOrder extends Model
{
    use SoftDeletes;

    protected $table = 'shop_orders';

    protected $fillable = [
        'customer_id',
        'order_number',
        'status',
        'payment_status',
        'total_amount',
        'shipping_amount',
        'tax_amount',
        'discount_amount',
        'final_amount',
        'coupon_id',
        'payment_method_id',
        'shipping_method_id',
        'shipping_address',
        'shipping_city',
        'shipping_postal_code',
        'shipping_country',
        'notes',
        'paid_at',
        'shipped_at',
        'delivered_at',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'shipping_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Zákazník
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(ShopCustomer::class, 'customer_id');
    }

    /**
     * Položky objednávky
     */
    public function items(): HasMany
    {
        return $this->hasMany(ShopOrderItem::class, 'order_id');
    }

    /**
     * Slevový kupón
     */
    public function coupon(): BelongsTo
    {
        return $this->belongsTo(ShopCoupon::class, 'coupon_id');
    }

    /**
     * Způsob platby
     */
    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(ShopPaymentMethod::class, 'payment_method_id');
    }

    /**
     * Způsob dopravy
     */
    public function shippingMethod(): BelongsTo
    {
        return $this->belongsTo(ShopShippingMethod::class, 'shipping_method_id');
    }

    /**
     * Scope pro aktivní objednávky
     */
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['canceled', 'returned']);
    }

    /**
     * Scope pro zaplacené objednávky
     */
    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    /**
     * Scope pro čekající na zaplacení
     */
    public function scopePending($query)
    {
        return $query->where('payment_status', 'pending');
    }

    /**
     * Vrátí dostupné stavy objednávky
     */
    public static function getStatusOptions(): array
    {
        return [
            'pending' => 'Čeká na potvrzení',
            'confirmed' => 'Potvrzena',
            'processing' => 'Zpracovávání',
            'shipped' => 'Odeslána',
            'delivered' => 'Doručena',
            'returned' => 'Vrácena',
            'canceled' => 'Zrušena',
        ];
    }

    /**
     * Vrátí dostupné stavy platby
     */
    public static function getPaymentStatusOptions(): array
    {
        return [
            'pending' => 'Čeká se na platbu',
            'paid' => 'Zaplacena',
            'failed' => 'Platba selhala',
            'refunded' => 'Vráceny peníze',
            'cod' => 'Dobírka',
        ];
    }

/**
     * Generuje číslo objednávky (bere v potaz i smazané záznamy)
     */
    public static function generateOrderNumber(): string
    {
        $prefix = date('Ym'); // Formát: 202605
        
        // Přidáno withTrashed(), aby generátor viděl i smazané objednávky v koši
        // Seřazeno podle order_number sestupně pro získání skutečně nejvyššího čísla
        $lastOrder = self::withTrashed()
            ->where('order_number', 'like', $prefix . '%')
            ->orderBy('order_number', 'desc')
            ->first();

        $nextNumber = 1;
        if ($lastOrder) {
            // Získáme posledních 4 cifry z čísla (např. z 2026050001 získá 0001)
            $lastSequence = (int) substr($lastOrder->order_number, -4);
            $nextNumber = $lastSequence + 1;
        }

        // Složí prefix a číslo zarovnané nulami (např. 2026050002)
        return $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }
    /**
     * Vrátí text statusu
     */
    public function getStatusLabel(): string
    {
        return self::getStatusOptions()[$this->status] ?? $this->status;
    }

    /**
     * Vrátí text payment statusu
     */
    public function getPaymentStatusLabel(): string
    {
        return self::getPaymentStatusOptions()[$this->payment_status] ?? $this->payment_status;
    }
    /**
 * Vrátí položky z objednávky zpět na sklad
 */
public function restoreStock(): void
{
    foreach ($this->items as $item) {
        if ($item->product_variant_id) {
            // Máme variantu - navýšíme ji a syncneme hlavní produkt
            $variant = \App\Models\Shop\ShopProductVariant::find($item->product_variant_id);
            if ($variant) {
                $variant->increment('stock_quantity', $item->quantity);
                // Zavoláme naši statickou metodu pro přepočet hlavního produktu
                \App\Models\Shop\ShopProductVariant::forceSyncParentStock($variant->product_id);
            }
        } else {
            // Nemáme variantu - navýšíme přímo hlavní produkt
            $product = \App\Models\Shop\ShopProduct::find($item->product_id);
            if ($product) {
                $product->increment('stock_quantity', $item->quantity);
            }
        }
    }
    
    \Log::info("Stock restored for order: {$this->order_number}");
}
}