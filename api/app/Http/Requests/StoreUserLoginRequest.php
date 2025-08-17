<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserLoginRequest extends FormRequest
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
            'user_email' => ['required', 'string', 'email', 'max:255', 'unique:user_login,user_email'],
            // Validace pro user_password_hash, jak je posíláno z frontendu
            'user_password_hash' => ['required', 'string', 'min:8'],
            // Validace pro role_id, s kontrolou existence v tabulce roles
            'role_id' => ['required', 'numeric', 'exists:roles,role_id'],
        ];
    }
}
