<?php

namespace App\Http\Requests\Shop\ShopSupplier;

use Illuminate\Foundation\Http\FormRequest;

class StoreShopSupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:200',
            'ico' => 'nullable|string|max:20|unique:shop_suppliers,ico',
            'contact_person' => 'nullable|string|max:150',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'country' => 'nullable|string|max:50',
            'payment_terms' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ];
    }
}