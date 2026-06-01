<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ShopPaymentMethod extends Model
{
    use SoftDeletes;

    protected $table = 'shop_payment_methods';

    protected $fillable = [
        'code',
        'name',
        'image_path',
        'description',
        'price',
        'provider',
        'is_external',
        'bank_account_number',
        'bank_account_code',
        'bank_iban',
        'bank_swift_bic',
        'variable_symbol_type',
        'is_active',
        'sort_order',
        'config',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_external' => 'boolean',
        'price' => 'decimal:2',
        'sort_order' => 'integer',
        'config' => 'array',
    ];
}