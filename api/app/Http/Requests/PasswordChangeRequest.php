<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class PasswordChangeRequest extends FormRequest
{
    /**
     * Určuje, zda je uživatel autorizován k provedení tohoto požadavku.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Povolíme pouze přihlášeným uživatelům měnit heslo.
        return Auth::check();
    }

    /**
     * Získává pravidla pro validaci, které platí pro požadavek.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'old_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
            'target_user_id' => ['sometimes', 'integer', 'exists:user_login,user_login_id'],
        ];
    }
}
