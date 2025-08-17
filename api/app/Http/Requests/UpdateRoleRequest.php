<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserLoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_email' => [
                'sometimes', 
                'string', 
                'email', 
                'max:255', 
                // Správně ignoruje unikátní e-mail pro aktuálního uživatele
                Rule::unique('user_login', 'user_email')->ignore($this->route('userLogin')->user_login_id, 'user_login_id')
            ],
            // Změněno z user_password na user_password_hash, aby odpovídalo datům z frontendu
            'user_password_hash' => ['sometimes', 'string', 'min:8'],
            // Přidáno pole role_id, protože jej chcete aktualizovat
            'role_id' => ['sometimes', 'numeric', 'exists:roles,role_id'],
            'is_deleted' => ['sometimes', 'boolean'],
        ];
    }
}
