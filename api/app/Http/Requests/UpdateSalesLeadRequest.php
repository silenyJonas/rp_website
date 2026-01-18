<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSalesLeadRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'subject_name'       => ['sometimes', 'string', 'max:255'],
            'first_contact_date' => ['sometimes', 'date'],
            'source_channel'     => ['sometimes', 'string', 'max:255'],
            'contact_person'     => ['nullable', 'string', 'max:255'],
            'contact_email'      => ['nullable', 'string', 'max:255'],
            'contact_phone'      => ['nullable', 'string', 'max:255'],
            'contact_other'      => ['nullable', 'string', 'max:255'],
            'location'           => ['nullable', 'string', 'max:100'],
            'source_url'         => ['nullable', 'string', 'max:500'],
            'description'        => ['nullable', 'string'],
            'priority'           => ['nullable', 'string', 'max:255'],
            'status'             => ['nullable', 'string', 'max:255'],
            'last_contact_date'  => ['nullable', 'date'],
            'next_step'          => ['nullable', 'string', 'max:255'],
            'rejection_reason'   => ['nullable', 'string'],
        ];
    }
}