<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Role; // <-- Přidán import pro Role

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $user = $this->route('user') ?? $this->route('user_login');
        $userId = is_object($user) ? $user->id : $user;

        return [
            'user_email' => [
                'sometimes', 'required', 'string', 'min:3', 'max:255',
                'regex:/^[a-zA-Z0-9._-]+$/',
                Rule::unique('users', 'user_email')->ignore($userId),
            ],
            'contact_email'       => ['nullable', 'email', 'max:255'],
            'full_name'           => ['sometimes', 'required', 'string', 'max:255'],
            'birth_date'          => ['nullable', 'date'],
            'personal_id_num'     => ['nullable', 'string', 'max:20'],
            'address'             => ['nullable', 'string'],
            'bank_account'        => ['nullable', 'string', 'max:50'],
            'health_insurance'    => ['nullable', 'string', 'max:10'],
            'commission_rate'     => ['nullable', 'integer', 'min:0', 'max:100'],
            'dpp_hours_spent'     => ['nullable', 'integer', 'min:0'],
            'has_tax_declaration' => ['boolean'],
            'phone_number'        => ['nullable', 'string', 'max:20'],
            'internal_note'       => ['nullable', 'string'],
            'user_password_hash'  => ['nullable', 'string', 'min:8'],
            
            // 👇 Opraveno: Ověřuje proti reálné tabulce z modelu Role
            'role_id'             => ['sometimes', 'required', 'integer', Rule::exists(Role::class, 'id')],
        ];
    }
}