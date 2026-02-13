<?php

namespace App\Http\Requests\SalesOrder;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSalesOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            // Změněno na nullable, aby prošla validace i bez lead_id
            'lead_id'           => 'sometimes|nullable|exists:sales_leads,id',
            'salesman_name'     => 'sometimes|required|string|max:255',
            'ico'               => 'nullable|string|max:20',
            'client_name'       => 'sometimes|required|string|max:255',
            'client_address'    => 'nullable|string|max:500',
            'client_phone'      => 'nullable|string|max:255',
            'client_email'      => 'nullable|email|max:255',
            'order_description' => 'nullable|string',
        ];
    }
}