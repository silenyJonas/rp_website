<?php

namespace App\Http\Requests\Core\CoreRole;

use Illuminate\Foundation\Http\FormRequest;

class StoreCoreRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Předpokládáme, že autorizaci řeší middleware v api.php
        return true;
    }

    public function rules(): array
    {
        return [
            'role_name'     => ['required', 'string', 'max:50', 'unique:roles,role_name'],
            'description'   => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'role_name.unique' => 'Tato role již existuje.',
            'role_name.required' => 'Název role je povinný.',
        ];
    }
}