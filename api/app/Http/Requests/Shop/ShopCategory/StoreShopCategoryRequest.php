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
        if (!$this->slug && $this->name) {
            $this->merge(['slug' => Str::slug($this->name)]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:150',
            'slug' => [
                'required',
                'string',
                'max:150',
                // Unikátní pouze pro dané parent_id
                Rule::unique('shop_categories')->where(function ($query) {
                    return $query->where('parent_id', $this->parent_id);
                }),
            ],
            'description' => 'nullable|string',
            'parent_id' => 'nullable|integer|exists:shop_categories,id',
            'image_path' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}