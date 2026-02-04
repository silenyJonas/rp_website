<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJobApplicationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'first_name'    => 'required|string|max:100',
            'last_name'     => 'required|string|max:100',
            'email'         => 'required|email|max:150',
            'phone'         => 'nullable|string|max:30',
            'position_name' => 'required|string|max:150',
            'message'       => 'nullable|string',
            
            'cv_file'       => [
                'required',
                'file',
                'max:20480', // 20MB limit
                function ($attribute, $value, $fail) {
                    if (!$value->isValid()) {
                        return $fail('Soubor nebyl nahrán správně.');
                    }
                    
                    // Blacklist nebezpečných přípon
                    $forbidden = ['php', 'exe', 'bat', 'sh', 'js', 'bin', 'msi', 'cgi', 'pl'];
                    $extension = strtolower($value->getClientOriginalExtension());
                    
                    if (in_array($extension, $forbidden)) {
                        $fail('Tento typ souboru (.' . $extension . ') je zakázán.');
                    }
                },
            ],
            'dataProcessingAgreement' => 'required|accepted',
        ];
    }
}