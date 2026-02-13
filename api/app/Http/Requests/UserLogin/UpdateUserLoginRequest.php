<?php

namespace App\Http\Requests\UserLogin;

use App\Models\UserLogin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user = $this->route('user_login');

        return [
            'user_email' => [
                'required',
                'string',
                'regex:/^[a-zA-Z0-9._-]+$/', 
                'min:3',
                'max:255',
                Rule::unique('user_login', 'user_email')->ignore($user->user_login_id, 'user_login_id'),
            ],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'full_name' => ['required', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'personal_id_num' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'bank_account' => ['nullable', 'string', 'max:50'],
            'health_insurance' => ['nullable', 'string', 'max:10'],
            'commission_rate' => ['integer', 'min:0', 'max:100'],
            'dpp_hours_spent' => ['integer', 'min:0'],
            'has_tax_declaration' => ['boolean'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'internal_note' => ['nullable', 'string'],
            'user_password_hash' => ['nullable', 'string', 'min:8'],
            'is_deleted' => ['boolean'],
            'role_id' => ['required', 'integer', 'exists:roles,role_id'],
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