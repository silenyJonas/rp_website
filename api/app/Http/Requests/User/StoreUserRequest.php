<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule; // <-- Přidán import pro Rule
use App\Models\Role; // <-- Přidán import pro Role

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'user_email'         => ['required', 'string', 'min:3', 'max:255', 'regex:/^[a-zA-Z0-9._-]+$/', 'unique:users,user_email'],
            'contact_email'      => ['nullable', 'email', 'max:255'],
            'full_name'          => ['required', 'string', 'max:255'],
            'user_password_hash' => ['required', 'string', 'min:8'],
            
            // 👇 Opraveno: Ověřuje proti reálné tabulce definované v modelu Role
            'role_id'            => ['required', 'numeric', Rule::exists(Role::class, 'id')], 
            
            'birth_date'         => ['nullable', 'date'],
            'phone_number'       => ['nullable', 'string', 'max:20'],
            'personal_id_num'    => ['nullable', 'string', 'max:20'],
            'address'            => ['nullable', 'string'],
            'bank_account'       => ['nullable', 'string', 'max:50'],
            'health_insurance'   => ['nullable', 'string', 'max:10'],
            'commission_rate'    => ['nullable', 'numeric', 'min:0', 'max:100'],
            'internal_note'      => ['nullable', 'string'],
            'has_tax_declaration' => ['nullable', 'boolean'],
            'dpp_hours_spent'     => ['nullable', 'integer', 'min:0'],
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'has_tax_declaration' => filter_var($this->has_tax_declaration, FILTER_VALIDATE_BOOLEAN),
            'commission_rate'     => $this->filled('commission_rate') ? $this->commission_rate : 10,
            'dpp_hours_spent'     => $this->filled('dpp_hours_spent') ? $this->dpp_hours_spent : 0,
        ]);
    }

    public function messages(): array
    {
        return [
            'user_email.regex' => 'Login může obsahovat pouze písmena, čísla a znaky . _ -',
            'user_email.unique' => 'Tento login je již obsazen.',
        ];
    }
}