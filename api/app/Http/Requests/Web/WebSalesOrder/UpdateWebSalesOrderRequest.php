<?php

namespace App\Http\Requests\Web\WebSalesOrder;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule; // 👈 Přidán import pro Rule
use App\Models\Web\WebSalesLead; // 👈 Přidán import pro tvůj model

class UpdateWebSalesOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $safeExtensions = [
            'pdf', 'jpg', 'jpeg', 'png', 'zip', 'docx', 'xlsx', 'dwg', 'dxf', 'stp', 'step'
        ];

        return [
            // 👇 Opraveno: kontroluje existenci proti správnému modelu/tabulce web_sales_leads
            'lead_id'           => ['sometimes', 'nullable', Rule::exists(WebSalesLead::class, 'id')],
            'salesman_name'     => 'sometimes|required|string|max:255',
            'ico'               => 'nullable|string|max:20',
            'client_name'       => 'sometimes|required|string|max:255',
            'client_address'    => 'nullable|string|max:500',
            'client_phone'      => 'nullable|string|max:255',
            'client_email'      => 'nullable|email|max:255',
            'order_description' => 'nullable|string',
            'attachment'        => [
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
            'attachment.mimes' => 'Povolené formáty pro přílohy objednávek jsou PDF, Word, Excel, CAD formáty nebo obrázky.',
            'attachment.max'   => 'Soubor přílohy nesmí přesáhnout 20 MB.',
        ];
    }
}