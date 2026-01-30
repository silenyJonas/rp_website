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
            'salesman_name'     => 'required|string|max:255',
            'ico'               => 'nullable|string|max:20',
            'client_name'       => 'required|string|max:255',
            'client_address'    => 'nullable|string|max:500',
            'client_phone'      => 'nullable|string|max:255',
            'client_email'      => 'nullable|email|max:255',
            'order_description' => 'nullable|string',
        ];
    }
}