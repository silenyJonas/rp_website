<?php

namespace App\Http\Requests\Shop\ShopCategory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreShopCategoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    protected function prepareForValidation()
    {
        // 1. Automatický slug
        if (!$this->slug && $this->name) {
            $this->merge(['slug' => Str::slug($this->name)]);
        }

        // 2. Defaultní stav: neaktivní (false)
        // Používáme merge, aby se hodnota is_active rovnala false, pokud nebyla zaslána
        $this->merge([
            'is_active' => $this->boolean('is_active', false)
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:150',
            'slug' => [
                'required',
                'string',
                'max:150',
                Rule::unique('shop_categories')->where(function ($query) {
                    return $query->where('parent_id', $this->parent_id);
                }),
            ],
            'description' => 'nullable|string',
            'parent_id' => 'nullable|integer|exists:shop_categories,id',
            'image_path' => 'nullable|string|max:255',
            'is_active' => 'boolean', // Nyní vždy přítomno díky merge v prepareForValidation
            'sort_order' => 'integer',
        ];
    }
}