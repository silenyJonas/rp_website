<?php

namespace App\Http\Requests\Web\WebNews;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWebNewsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'    => ['sometimes', 'required', 'string', 'max:255'],
            'message'  => ['sometimes', 'required', 'string'],
            'author'   => ['sometimes', 'required', 'string', 'max:255'],
            'thema'    => ['sometimes', 'required', 'string', 'max:255'],
            'bullet_1' => ['nullable', 'string', 'max:255'],
            'bullet_2' => ['nullable', 'string', 'max:255'],
            'bullet_3' => ['nullable', 'string', 'max:255'],
            'bullet_4' => ['nullable', 'string', 'max:255'],
        ];
    }
}