<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSupportTicketRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'category'    => 'required|string|max:100',
            'priority'    => 'nullable|string|max:50',
            'subject'     => 'required|string|max:255',
            'description' => 'required|string',
            'attachment'  => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png,zip|max:10240',
        ];
    }

    public function messages(): array
    {
        return [
            'attachment.max' => 'Soubor nesmí být větší než 10 MB.',
            'attachment.mimes' => 'Nepodporovaný formát souboru.',
        ];
    }
}