<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSalesOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'lead_id'           => 'required|exists:sales_leads,id',
            'client_name'       => 'required|string|max:255',
            'client_email'      => 'required|email|max:255',
            'order_description' => 'required|string',
            'ico'               => 'nullable|string|max:20',
            'client_address'    => 'nullable|string|max:500',
            'client_phone'      => 'nullable|string|max:20',
            
            // Validace pro nahrávaný soubor
            // max:10240 znamená limit 10MB
            'attachment'        => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png,zip|max:10240',

            // dataProcessingAgreement musí být 'accepted' (1, true, "on", nebo "yes")
            'dataProcessingAgreement' => 'required|accepted',
        ];
    }

    /**
     * Volitelné: Vlastní chybové hlášky pro lepší UX
     */
    public function messages(): array
    {
        return [
            'lead_id.exists' => 'Neplatné ID obchodního případu.',
            'attachment.max' => 'Soubor je příliš velký (maximální velikost je 10 MB).',
            'attachment.mimes' => 'Podporované formáty jsou PDF, Word, obrázky nebo ZIP.',
            'dataProcessingAgreement.accepted' => 'Musíte souhlasit se zpracováním osobních údajů.',
        ];
    }
}