<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class ShopCoupon extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'description',
        'discount_type',
        'discount_value',
        'max_usage',
        'usage_count',
        'min_order_amount',
        'applies_to',
        'valid_from',
        'valid_until',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'discount_value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'max_usage' => 'integer',
        'usage_count' => 'integer',
    ];

    /**
     * Komplexní kontrola platnosti kupónu
     */
    public function isValid(float $currentTotal = 0): bool
    {
        // 1. Základní kontrola aktivity
        if (!$this->is_active) {
            return false;
        }

        // 2. Kontrola časové platnosti (pokud jsou data nastavena)
        $now = Carbon::now();
        if ($this->valid_from && $this->valid_from->isFuture()) {
            return false;
        }
        if ($this->valid_until && $this->valid_until->isPast()) {
            return false;
        }

        // 3. Kontrola maximálního počtu použití
        if ($this->max_usage > 0 && $this->usage_count >= $this->max_usage) {
            return false;
        }

        // 4. Kontrola minimální výše objednávky
        if ($this->min_order_amount > 0 && $currentTotal < (float)$this->min_order_amount) {
            return false;
        }

        return true;
    }
}