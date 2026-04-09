<?php

namespace App\Http\Requests\Web\WebSupportTicket;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWebSupportTicketRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $safeExtensions = [
            'pdf', 'doc', 'docx', 'dotx', 'odt', 'pages', 'rtf', 'txt', 'csv',
            'xls', 'xlsx', 'xlsm', 'xltx', 'ods', 'numbers', 'ppt', 'pptx', 'key',
            'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'tif', 'heic', 'heif', 'psd', 'ai', 'eps',
            'zip', 'rar', '7z', 'tar', 'gz',
            'mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac',
            'mp4', 'mov', 'avi', 'wmv', 'mkv', 'webm',
            'dwg', 'dxf', 'stp', 'step', 'stl', 'obj'
        ];

        return [
            'category'         => ['sometimes', 'required', 'string', 'max:100'],
            'priority'         => ['sometimes', 'required', 'string', 'max:50'],
            'state'            => ['sometimes', 'required', 'string', 'max:50'],
            'subject'          => ['sometimes', 'required', 'string', 'max:255'],
            'description'      => ['sometimes', 'required', 'string'],
            'user_name_plain'  => ['sometimes', 'required', 'string', 'max:255'],
            'user_plain' => ['sometimes', 'required', 'string', 'max:255'],
            
            'attachment'       => [
                'nullable', 
                'file', 
                'mimes:' . implode(',', $safeExtensions), 
                'max:20480'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'attachment.max'   => 'Soubor nesmí být větší než 20 MB.',
            'attachment.mimes' => 'Tento typ souboru není povolen.',
        ];
    }
}