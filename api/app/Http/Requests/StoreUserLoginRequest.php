<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_email' => [
                'required', 
                'string', 
                'regex:/^[a-zA-Z0-9._-]+$/',
                'min:3',
                'max:255', 
                'unique:user_login,user_email'
            ],
            'contact_email' => ['nullable', 'email', 'max:255'], // NOVÉ
            'full_name' => ['required', 'string', 'max:255'],
            'commission_rate' => ['integer', 'min:0', 'max:100'],
            'user_password_hash' => ['required', 'string', 'min:8'],
            'role_id' => ['required', 'numeric', 'exists:roles,role_id'],
            
            'birth_date' => ['nullable', 'date'],
            'phone_number' => ['nullable', 'string'],
        ];
    }

    public function messages()
    {
        return [
            'user_email.regex' => 'Login může obsahovat pouze písmena, čísla a znaky . _ -',
            'contact_email.email' => 'Zadejte platnou e-mailovou adresu.',
        ];
    }
}