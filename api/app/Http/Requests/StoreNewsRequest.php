<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNewsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Povoleno pro všechny (nebo uprav dle práv)
    }

    public function rules(): array
    {
        return [
            'title'    => ['required', 'string', 'max:255'],
            'message'  => ['required', 'string'],
            'author'   => ['required', 'string', 'max:255'],
            'thema'    => ['required', 'string', 'max:255'],
            'bullet_1' => ['nullable', 'string', 'max:255'],
            'bullet_2' => ['nullable', 'string', 'max:255'],
            'bullet_3' => ['nullable', 'string', 'max:255'],
            'bullet_4' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'   => 'Titulka novinky je povinná.',
            'message.required' => 'Obsah zprávy nesmí být prázdný.',
            'author.required'  => 'Autor musí být vyplněn.',
            'thema.required'   => 'Téma je povinné.',
        ];
    }
}