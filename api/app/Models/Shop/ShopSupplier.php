<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShopSupplier extends Model
{
    use SoftDeletes;

    protected $table = 'shop_suppliers';

    protected $fillable = [
        'name',
        'ico',
        'contact_person',
        'email',
        'phone',
        'address',
        'city',
        'postal_code',
        'country',
        'payment_terms',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Relace na produkty, které tento dodavatel dodává.
     */
    public function products(): HasMany
    {
        return $this->hasMany(ShopProduct::class, 'supplier_id');
    }
}