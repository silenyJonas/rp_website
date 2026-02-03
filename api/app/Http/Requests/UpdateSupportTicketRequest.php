<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSupportTicketRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'category'    => 'sometimes|required|string|max:100',
            'priority'    => 'sometimes|required|string|max:50',
            'state'       => 'sometimes|required|string|max:50',
            'subject'     => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            // Pokud bys chtěl měnit i přílohu při updatu:
            'attachment'  => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png,zip|max:10240',
        ];
    }
}