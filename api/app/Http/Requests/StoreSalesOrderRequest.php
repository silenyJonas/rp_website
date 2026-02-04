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
            
            'attachment'        => [
                'nullable',
                'file',
                'max:20480', //limit 20M
                function ($attribute, $value, $fail) {
                    if ($this->hasFile('attachment')) {
                        $file = $this->file('attachment');
                        if (!$file->isValid()) return $fail('Chyba nahrávání souboru.');

                        $forbidden = ['php', 'exe', 'bat', 'sh', 'js', 'bin', 'msi', 'cgi', 'pl'];
                        $extension = strtolower($file->getClientOriginalExtension());
                        
                        if (in_array($extension, $forbidden)) {
                            $fail('Soubor .' . $extension . ' je zakázán.');
                        }
                    }
                },
            ],
            'dataProcessingAgreement' => 'required|accepted',
        ];
    }
}