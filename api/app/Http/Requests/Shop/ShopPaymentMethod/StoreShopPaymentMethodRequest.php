<?php

namespace App\Http\Requests\Shop\ShopPaymentMethod;

use Illuminate\Foundation\Http\FormRequest;

class StoreShopPaymentMethodRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'code' => 'required|string|max:50|unique:shop_payment_methods,code',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'provider' => 'required|string|max:50',
            'is_external' => 'boolean',
            'bank_account_number' => 'nullable|string|max:50',
            'bank_account_code' => 'nullable|string|max:10',
            'bank_iban' => 'nullable|string|max:34',
            'bank_swift_bic' => 'nullable|string|max:11',
            'variable_symbol_type' => 'required|in:order_number,phone_number,none',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}