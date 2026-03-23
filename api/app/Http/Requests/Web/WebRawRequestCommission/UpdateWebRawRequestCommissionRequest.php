<?php


namespace App\Http\Requests\Web\WebRawRequestCommission;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWebRawRequestCommissionRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'thema'             => ['sometimes', 'string', 'max:255'],
            'contact_email'     => ['sometimes', 'email', 'max:255'],
            'contact_phone'     => ['nullable', 'string', 'max:255'],
            'order_description' => ['sometimes', 'string'],
            'status'            => ['sometimes', 'string', 'in:Nově zadané,Zpracovává se,Dokončeno,Zrušeno'],
            'priority'          => ['sometimes', 'string', 'in:Nízká,Neutrální,Vysoká'],
            'note'              => ['sometimes', 'nullable', 'string'],
        ];
    }
}
