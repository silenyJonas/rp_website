<?php

namespace App\Http\Requests\Shop;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShopCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categoryId = $this->route('category');

        return [
            'name' => 'required|string|max:150',
            'slug' => 'required|string|max:150|unique:shop_categories,slug,' . $categoryId,
            'description' => 'nullable|string',
            'parent_id' => 'nullable|integer|exists:shop_categories,id|not_in:' . $categoryId, // Nemůže být rodič sám sobě
            'image_path' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ];
    }
}