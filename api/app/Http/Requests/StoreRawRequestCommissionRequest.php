<?php

// namespace App\Http\Requests;

// use Illuminate\Foundation\Http\FormRequest;

// class StoreRawRequestCommissionRequest extends FormRequest
// {
//     /**
//      * Určete, zda má uživatel oprávnění provést tento požadavek.
//      * U veřejného formuláře je to obvykle true, pokud není specifická logika.
//      */
//     public function authorize(): bool
//     {
//         return true;
//     }

//     /**
//      * Získejte validační pravidla, která se vztahují na požadavek.
//      *
//      * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
//      */
//     public function rules(): array
//     {
       
//          return [
//             'thema' => ['required', 'string', 'max:255'],
//             'contact_email' => ['required', 'email', 'max:255'],
//             'contact_phone' => ['nullable', 'string', 'max:255'],
//             'order_description' => ['required', 'string', 'max:255'],
//             'status' => ['sometimes', 'string', 'in:Nově zadané,Zpracovává se,Dokončeno,Zrušeno'],
//             'priority' => ['sometimes', 'string', 'in:Nízká,Neutrální,Vysoká'],
//         ];
//     }

//     /**
//      * Získejte vlastní chybové zprávy pro definovaná validační pravidla.
//      *
//      * @return array<string, string>
//      */
//     public function messages(): array
//     {
//         return [
//             'thema.required' => 'Téma je povinné.',
//             'contact_email.required' => 'E-mail je povinný.',
//             'contact_email.email' => 'Zadejte platný e-mail.',
//             'order_description.required' => 'Popis objednávky je povinný.',
//             // Zprávy pro status a priority byly odstraněny, protože už nejsou validovány zde.
//         ];
//     }
// }

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRawRequestCommissionRequest extends FormRequest
{
    /**
     * Určete, zda má uživatel oprávnění provést tento požadavek.
     * U veřejného formuláře je to obvykle true, pokud není specifická logika.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Získejte validační pravidla, která se vztahují na požadavek.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'thema' => ['required', 'string', 'max:255'],
            'contact_email' => ['required', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:255'],
            'order_description' => ['required', 'string', 'max:255'],
            'status' => ['sometimes', 'string', 'in:Nově zadané,Zpracovává se,Dokončeno,Zrušeno'],
            'priority' => ['sometimes', 'string', 'in:Nízká,Neutrální,Vysoká'],
            'note' => ['nullable', 'string'], // Přidán nový sloupec 'note'
        ];
    }

    /**
     * Získejte vlastní chybové zprávy pro definovaná validační pravidla.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'thema.required' => 'Téma je povinné.',
            'contact_email.required' => 'E-mail je povinný.',
            'contact_email.email' => 'Zadejte platný e-mail.',
            'order_description.required' => 'Popis objednávky je povinný.',
        ];
    }
}
