<?php

namespace App\Http\Requests;

use App\Models\UserLogin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user = $this->route('user_login');

        return [
            // ZMĚNA: Odstraněno 'email', přidán regex pro login (písmena, čísla, tečka, podtržítko, pomlčka)
            'user_email' => [
                'required',
                'string',
                'regex:/^[a-zA-Z0-9._-]+$/', 
                'min:3',
                'max:255',
                Rule::unique('user_login', 'user_email')->ignore($user->user_login_id, 'user_login_id'),
            ],
            'user_password_hash' => [
                'nullable',
                'string',
                'min:8',
            ],
            'user_password_salt' => [
                'nullable',
                'string',
            ],
            'last_login_at' => [
                'nullable',
                'date',
            ],
            'is_deleted' => [
                'boolean',
            ],
            'role_id' => [
                'required',
                'integer',
                'exists:roles,role_id',
            ],
        ];
    }

    // Volitelné: Vlastní chybová hláška pro regex
    public function messages()
    {
        return [
            'user_email.regex' => 'Login může obsahovat pouze písmena, čísla a znaky . _ -',
        ];
    }
}