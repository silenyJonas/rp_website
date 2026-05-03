<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShopCustomer extends Model
{
    use SoftDeletes;

    protected $table = 'shop_customers';

    protected $fillable = [
        'user_id',
        'email',
        'first_name',
        'last_name',
        'phone',
        'company',
        'address',
        'city',
        'postal_code',
        'country',
        'is_active',
        'total_spent',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'total_spent' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Objednávky zákazníka
     */
    public function orders(): HasMany
    {
        return $this->hasMany(ShopOrder::class, 'customer_id');
    }

    /**
     * Vrátí plné jméno
     */
    public function getFullName(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Scope pro aktivní zákazníky
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}