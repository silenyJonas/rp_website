<?php

namespace App\Http\Requests\Shop\ShopCoupon;

use Illuminate\Foundation\Http\FormRequest;

class StoreShopCouponRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'code' => 'required|string|max:50|unique:shop_coupons,code',
            'description' => 'nullable|string|max:255',
            'discount_type' => 'required|in:percent,fixed',
            'discount_value' => 'required|numeric|min:0',
            'max_usage' => 'nullable|integer|min:1',
            'min_order_amount' => 'nullable|numeric|min:0',
            'applies_to' => 'required|in:all,products,categories',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after_or_equal:valid_from',
            'is_active' => 'boolean',
        ];
    }
}