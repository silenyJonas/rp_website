<?php

namespace App\Http\Requests\Shop\ShopCustomer;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShopCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'user_id' => "nullable|exists:users,id|unique:shop_customers,user_id,$id",
            'email' => "sometimes|email|max:150|unique:shop_customers,email,$id",
            'first_name' => 'sometimes|string|max:100',
            'last_name' => 'sometimes|string|max:100',
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
            'email.unique' => 'Tento email je už používán.',
        ];
    }
}