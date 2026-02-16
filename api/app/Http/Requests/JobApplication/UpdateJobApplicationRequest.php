<?php

namespace App\Http\Requests\JobApplication;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJobApplicationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $safeExtensions = ['pdf', 'doc', 'docx', 'odt', 'jpg', 'jpeg', 'png', 'zip', 'rar'];

        return [
            'state'         => 'sometimes|required|string|max:50',
            'internal_note' => 'nullable|string',
            'first_name'    => 'sometimes|required|string|max:100',
            'last_name'     => 'sometimes|required|string|max:100',
            'email'         => 'sometimes|required|email|max:150',
            'phone'         => 'nullable|string|max:30',
            'position_name' => 'sometimes|required|string|max:150',
            'message'       => 'nullable|string',
            'cv_file'       => [
                'nullable', 
                'file', 
                'mimes:' . implode(',', $safeExtensions), 
                'max:20480'
            ],
        ];
    }
}