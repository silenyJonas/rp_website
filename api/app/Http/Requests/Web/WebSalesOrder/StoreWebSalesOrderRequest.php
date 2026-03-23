<?php

namespace App\Http\Requests\Web\WebSalesOrder;


use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule; 
use App\Models\Web\WebSalesLead;

class StoreWebSalesOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        // Rozsáhlý whitelist bezpečných souborů
        $safeExtensions = [
            // Dokumenty
            'pdf', 'doc', 'docx', 'dotx', 'odt', 'pages', 'rtf', 'txt', 'csv',
            // Tabulky a Prezentace
            'xls', 'xlsx', 'xlsm', 'xltx', 'ods', 'numbers', 'ppt', 'pptx', 'key',
            // Obrázky
            'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'tif', 'heic', 'heif', 'psd', 'ai', 'eps',
            // Archivy (bezpečné, pokud neobsahují exe uvnitř - co kontroluje AV)
            'zip', 'rar', '7z', 'tar', 'gz',
            // Audio
            'mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac',
            // Video
            'mp4', 'mov', 'avi', 'wmv', 'mkv', 'webm',
            // CAD a technické
            'dwg', 'dxf', 'stp', 'step', 'stl', 'obj'
        ];

        return [
            // 👇 Opraveno: kontroluje existenci proti správnému modelu/tabulce web_sales_leads
            'lead_id'           => ['nullable', Rule::exists(WebSalesLead::class, 'id')],
            'salesman_name'     => 'sometimes|nullable|string|max:255',
            'client_name'       => 'required|string|max:255',
            'client_email'      => 'required|email|max:255',
            'order_description' => 'required|string',
            'ico'               => 'nullable|string|max:20',
            'client_address'    => 'nullable|string|max:500',
            'client_phone'      => 'nullable|string|max:20',
            
            'attachment'        => [
                'nullable',
                'file',
                'max:20480', // 20MB
                'mimes:' . implode(',', $safeExtensions),
            ],
            'dataProcessingAgreement' => 'required|accepted',
            'tosAgreement'            => 'required|accepted',
        ];
    }

    public function messages(): array
    {
        return [
            'attachment.mimes' => 'Tento typ souboru není povolen. Nahrajte prosím běžný dokument, obrázek, video nebo archiv.',
            'attachment.max' => 'Maximální velikost souboru je 20 MB.',
            'dataProcessingAgreement.accepted' => 'Pro odeslání musíte souhlasit se zpracováním údajů.',
            'tosAgreement.accepted' => 'Pro odeslání musíte souhlasit s obchodními podmínkami.',
        ];
    }
}