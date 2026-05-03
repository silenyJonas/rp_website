<?php

namespace App\Http\Requests\Shop\ShopCustomer;

use Illuminate\Foundation\Http\FormRequest;

class StoreShopCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'nullable|exists:users,id|unique:shop_customers',
            'email' => 'required|email|max:150|unique:shop_customers',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:150',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'country' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email je povinný.',
            'email.unique' => 'Tento email už je zaregistrován.',
            'first_name.required' => 'Jméno je povinné.',
            'last_name.required' => 'Příjmení je povinné.',
        ];
    }
}