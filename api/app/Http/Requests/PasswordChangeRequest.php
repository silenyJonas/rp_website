<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class PasswordChangeRequest extends FormRequest
{

    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        return [
            'old_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
            'target_user_id' => ['sometimes', 'integer', 'exists:user_login,user_login_id'],
        ];
    }
}
