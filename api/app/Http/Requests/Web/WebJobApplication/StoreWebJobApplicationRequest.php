<?php

namespace App\Http\Requests\Web\WebJobApplication;

use Illuminate\Foundation\Http\FormRequest;

class StoreWebJobApplicationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $safeExtensions = [
            'pdf', 'doc', 'docx', 'odt', 'pages', 'rtf', 'txt',
            'jpg', 'jpeg', 'png', 'heic', 'heif',
            'zip', 'rar', '7z'
        ];

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
                'mimes:' . implode(',', $safeExtensions),
                'max:20480',
            ],
            'dataProcessingAgreement' => 'required|accepted',
        ];
    }

    public function messages(): array
    {
        return [
            'cv_file.required' => 'Prosím nahrajte svůj životopis.',
            'cv_file.mimes'    => 'Povolené formáty pro životopis jsou PDF, Word, obrázky nebo archivy.',
            'cv_file.max'      => 'Soubor nesmí být větší než 20 MB.',
        ];
    }
}