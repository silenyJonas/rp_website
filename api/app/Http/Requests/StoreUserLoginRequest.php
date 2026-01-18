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
            // ZMĚNA: Odstraněno 'email', nahrazeno obecným stringem/regexem
            'user_email' => [
                'required', 
                'string', 
                'regex:/^[a-zA-Z0-9._-]+$/',
                'min:3',
                'max:255', 
                'unique:user_login,user_email'
            ],
            'user_password_hash' => ['required', 'string', 'min:8'],
            'role_id' => ['required', 'numeric', 'exists:roles,role_id'],
        ];
    }

    public function messages()
    {
        return [
            'user_email.regex' => 'Login může obsahovat pouze písmena, čísla a znaky . _ -',
        ];
    }
}