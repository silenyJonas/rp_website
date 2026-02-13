<?php

namespace App\Http\Requests\Role;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role_name'         => 'required|string|max:50|unique:roles,role_name,' . $this->role->id,
            'description'       => 'nullable|string|max:255',
        ];
    }
}