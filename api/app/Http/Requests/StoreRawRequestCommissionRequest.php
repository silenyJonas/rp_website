<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRawRequestCommissionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'thema' => ['required', 'string', 'max:255'],
            'contact_email' => ['required', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:255'],
            'order_description' => ['required', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:Nově zadané,Zpracovává se,Dokončeno,Zrušeno'], // nebo uprav dle povolených stavů
            'priority' => ['nullable', 'string', 'in:Nízká,Neutrální,Vysoká'],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array
     */
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
