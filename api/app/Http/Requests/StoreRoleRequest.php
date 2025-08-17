<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Předpokládáme, že vytvářet role může každý, ale měli byste to omezit.
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
            'role_name' => ['required', 'string', 'max:50', 'unique:roles,role_name'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}