<?php

// namespace App\Http\Requests;

// use App\Models\UserLogin;
// use Illuminate\Foundation\Http\FormRequest;
// use Illuminate\Validation\Rule;

// class UpdateUserLoginRequest extends FormRequest
// {
//     /**
//      * Determine if the user is authorized to make this request.
//      *
//      * @return bool
//      */
//     public function authorize(): bool
//     {
//         // Předpokládáme, že autorizace je vždy povolena pro účely aktualizace
//         // Můžete sem přidat logiku pro ověření uživatele.
//         return true;
//     }

//     /**
//      * Get the validation rules that apply to the request.
//      *
//      * @return array
//      */
//     public function rules(): array
//     {
//         // Získání instance modelu UserLogin, která je vázána na trasu.
//         // Tím se zajistí, že validace ví, které id má ignorovat.
//         $user = $this->route('user_login');

//         return [
//             // E-mail musí být unikátní v tabulce 'user_login'
//             // ale musíme ignorovat aktuálního uživatele podle jeho 'user_login_id'.
//             // Používáme zde pravidlo 'unique', kterému předáme vlastní název klíče.
//             'user_email' => [
//                 'required',
//                 'email',
//                 'max:255',
//                 Rule::unique('user_login')->ignore($user->user_login_id, 'user_login_id'),
//             ],
//             // 'user_password_hash' může být volitelný, pokud ho nechceme měnit při aktualizaci.
//             // Pokud se posílá, musí být typu string.
//             'user_password_hash' => [
//                 'nullable',
//                 'string',
//             ],
//             // Pokud posíláte user_password_salt, musí být string.
//             'user_password_salt' => [
//                 'nullable',
//                 'string',
//             ],
//             // last_login_at by měl být ve správném formátu data.
//             'last_login_at' => [
//                 'nullable',
//                 'date',
//             ],
//             // is_deleted musí být boolean nebo 0/1.
//             'is_deleted' => [
//                 'boolean',
//             ],
//             // Nové pravidlo pro `role_id`, které je povinné.
//             'role_id' => [
//                 'required',
//                 'integer',
//                 'exists:roles,role_id',
//             ],
//         ];
//     }
// }


namespace App\Http\Requests;

use App\Models\UserLogin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserLoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Předpokládáme, že autorizace je vždy povolena pro účely aktualizace
        // Můžete sem přidat logiku pro ověření uživatele.
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        // Získání instance modelu UserLogin, která je vázána na trasu.
        // Tím se zajistí, že validace ví, které id má ignorovat.
        $user = $this->route('user_login');

        return [
            // E-mail musí být unikátní v tabulce 'user_login'
            // ale musíme ignorovat aktuálního uživatele podle jeho 'user_login_id'.
            // Používáme zde pravidlo 'unique', kterému předáme vlastní název klíče.
            'user_email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('user_login')->ignore($user->user_login_id, 'user_login_id'),
            ],
            // 'user_password_hash' může být volitelný, pokud ho nechceme měnit při aktualizaci.
            // Pokud se posílá, musí být typu string.
            'user_password_hash' => [
                'nullable',
                'string',
            ],
            // Pokud posíláte user_password_salt, musí být string.
            'user_password_salt' => [
                'nullable',
                'string',
            ],
            // last_login_at by měl být ve správném formátu data.
            'last_login_at' => [
                'nullable',
                'date',
            ],
            // is_deleted musí být boolean nebo 0/1.
            'is_deleted' => [
                'boolean',
            ],
            // Nové pravidlo pro `role_id`, které je povinné.
            'role_id' => [
                'required',
                'integer',
                'exists:roles,role_id',
            ],
        ];
    }
}
