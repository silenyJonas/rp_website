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
    // Získání ID z routy (předpokládá /api/roles/{role})
    $role = $this->route('role');
    $roleId = is_object($role) ? $role->id : $role; 

    return [
        // 'role_id' na konci unique pravidla říká, jak se jmenuje sloupec v DB
        'role_name'   => 'required|string|max:50|unique:roles,role_name,' . $roleId . ',id',
        'description' => 'nullable|string|max:255',
    ];
}
}