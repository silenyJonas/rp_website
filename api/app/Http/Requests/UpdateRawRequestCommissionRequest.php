<?php


namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRawRequestCommissionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Případně upravit podle oprávnění uživatele
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'thema' => ['sometimes', 'string', 'max:255'],
            'contact_email' => ['sometimes', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:255'],
            'order_description' => ['sometimes', 'string'],
            'status' => ['sometimes', 'string', 'in:Nově zadané,Zpracovává se,Dokončeno,Zrušeno'],
            'priority' => ['sometimes', 'string', 'in:Nízká,Neutrální,Vysoká'],
            'note' => ['sometimes', 'nullable', 'string'], // Přidán nový sloupec 'note'
        ];
    }
}
