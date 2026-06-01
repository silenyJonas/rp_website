<?php

namespace App\Http\Requests\Shop\ShopPaymentMethod;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateShopPaymentMethodRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('shop_payment_methods', 'code')->ignore($id),
            ],
            'name' => 'required|string|max:100',
            'image_path' => 'nullable|string|max:255',
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
            'config' => 'nullable|array',
        ];
    }
}