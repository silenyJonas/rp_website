<?php

namespace App\Http\Requests\BusinessLog;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBusinessLogRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'event_type'             => 'sometimes|string|max:50',
            'module'                 => 'sometimes|string|max:100',
            'description'            => 'sometimes|string|max:1000',
            'affected_entity_type'   => 'nullable|string|max:50',
            'affected_entity_id'     => 'nullable|integer',
            'context_data'           => 'nullable',
        ];
    }
}