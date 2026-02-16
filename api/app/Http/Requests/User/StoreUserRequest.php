<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'user_email'         => ['required', 'string', 'min:3', 'max:255', 'regex:/^[a-zA-Z0-9._-]+$/', 'unique:users,user_email'],
            'contact_email'      => ['nullable', 'email', 'max:255'],
            'full_name'          => ['required', 'string', 'max:255'],
            'commission_rate'    => ['nullable', 'integer', 'min:0', 'max:100'],
            'user_password_hash' => ['required', 'string', 'min:8'],
            // Opraveno na roles,id dle dumpu
            'role_id'            => ['required', 'numeric', 'exists:roles,id'], 
            'birth_date'         => ['nullable', 'date'],
            'phone_number'       => ['nullable', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_email.regex' => 'Login může obsahovat pouze písmena, čísla a znaky . _ -',
            'user_email.unique' => 'Tento login je již obsazen.',
        ];
    }
}