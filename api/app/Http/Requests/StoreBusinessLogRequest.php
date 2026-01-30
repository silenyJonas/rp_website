<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBusinessLogRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'origin'                 => 'nullable|string|max:255',
            'event_type'             => 'required|string|max:50',
            'module'                 => 'required|string|max:100',
            'description'            => 'required|string|max:1000',
            'affected_entity_type'   => 'nullable|string|max:50',
            'affected_entity_id'     => 'nullable|integer',
            'user_login_id'          => 'nullable|exists:user_login,user_login_id',
            'context_data'           => 'nullable', // JSON nebo pole
            'user_login_id_plain'    => 'nullable|string|max:255',
            'user_login_email_plain' => 'nullable|string|max:255',
        ];
    }
}