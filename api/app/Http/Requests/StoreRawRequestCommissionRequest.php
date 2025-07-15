<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRawRequestCommissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'thema' => ['required', 'string', 'max:255'],
            'contact_email' => ['required', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:255'],
            'order_description' => ['required', 'string', 'max:255'],
            'status' => ['sometimes', 'string', 'in:Nově zadané,Zpracovává se,Dokončeno,Zrušeno'],
            'priority' => ['sometimes', 'string', 'in:Nízká,Neutrální,Vysoká'],
        ];
    }

    public function messages(): array
    {
        return [
            'thema.required' => 'Téma je povinné.',
            'contact_email.required' => 'E-mail je povinný.',
            'contact_email.email' => 'Zadejte platný e-mail.',
            'order_description.required' => 'Popis objednávky je povinný.',
            'status.in' => 'Zvolený stav není platný.',
            'priority.in' => 'Zvolená priorita není platná.',
        ];
    }
}
