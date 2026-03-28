<?php

namespace App\Http\Requests\Shop;

use Illuminate\Foundation\Http\FormRequest;

class StoreShopProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'required|integer|exists:shop_categories,id',
            'supplier_id' => 'nullable|integer|exists:shop_suppliers,id', // Předpokládá se tabulka dodavatelů
            'name' => 'required|string|max:200',
            'slug' => 'required|string|max:200|unique:shop_products,slug',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|max:50|unique:shop_products,sku',
            'stock_quantity' => 'nullable|integer|min:0',
            'stock_warning_level' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
        ];
    }
}