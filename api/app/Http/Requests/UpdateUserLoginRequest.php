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
                Rule::unique('user_login', 'user_email')->ignore($this->route('userLogin')->user_login_id, 'user_login_id')
            ],
            'user_password' => ['sometimes', 'string', 'min:8'],
            'is_deleted' => ['sometimes', 'boolean'],
        ];
    }
}