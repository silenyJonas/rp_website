<?php

namespace App\Http\Requests\JobApplication;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJobApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Autorizaci řeší middleware v route
    }

    public function rules(): array
    {
        return [
            // Hlavní pole pro správu náboru
            'state'         => 'sometimes|required|string|max:50',
            'internal_note' => 'nullable|string',
            
            // Možnost opravit údaje (použito 'sometimes', aby se nemuselo posílat vše)
            'first_name'    => 'sometimes|required|string|max:100',
            'last_name'     => 'sometimes|required|string|max:100',
            'email'         => 'sometimes|required|email|max:150',
            'phone'         => 'nullable|string|max:30',
            'position_name' => 'sometimes|required|string|max:150',
            'message'       => 'nullable|string',
        ];
    }
}