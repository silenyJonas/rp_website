<?php

namespace App\Http\Requests\SalesOrder;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSalesOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $safeExtensions = [
            'pdf', 'jpg', 'jpeg', 'png', 'zip', 'docx', 'xlsx', 'dwg', 'dxf', 'stp', 'step'
        ];

        return [
            'lead_id'           => 'sometimes|nullable|exists:sales_leads,id',
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