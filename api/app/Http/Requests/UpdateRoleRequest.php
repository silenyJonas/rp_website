<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Upravte podle oprávnění uživatele.
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $roleId = $this->route('role')->role_id;

        return [
            'role_name' => ['sometimes', 'string', 'max:50', 'unique:roles,role_name,' . $roleId . ',role_id'],
            'description' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}