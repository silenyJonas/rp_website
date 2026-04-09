<?php

namespace App\Http\Requests\Shop\ShopShippingMethod;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShopShippingMethodRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('id');
        return [
            'code' => 'required|string|max:50|unique:shop_shipping_methods,code,' . $id,
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'shipping_type' => 'required|string|max:30',
            'base_price' => 'required|numeric|min:0',
            'allows_cod' => 'boolean',
            'cod_price' => 'nullable|numeric|min:0',
            'free_shipping_threshold' => 'nullable|numeric|min:0',
            'max_weight' => 'nullable|numeric|min:0',
            'requires_pickup_point' => 'boolean',
            'tracking_url' => 'nullable|string|max:255',
            'logo_path' => 'nullable|string|max:255',
            'delivery_days_min' => 'nullable|integer|min:0',
            'delivery_days_max' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}