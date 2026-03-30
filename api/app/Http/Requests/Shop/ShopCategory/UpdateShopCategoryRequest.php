<?php

namespace App\Http\Requests\Shop\ShopCategory;


use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use App\Models\Shop\ShopCategory;

class UpdateShopCategoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    protected function prepareForValidation()
    {
        // Slug generujeme pouze pokud je v požadavku jméno, ale chybí slug
        if ($this->has('name') && !$this->filled('slug')) {
            $this->merge(['slug' => Str::slug($this->name)]);
        }
    }

    public function rules(): array
    {
        $id = $this->route('id');
        
        return [
            // Změna z 'required' na 'sometimes|required'
            'name' => 'sometimes|required|string|max:150',
            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:150',
                Rule::unique('shop_categories')->where(function ($query) {
                    // Musíme zajistit, aby parent_id bralo buď z requestu, 
                    // nebo (pokud v requestu není) z existujícího modelu v DB
                    $parentId = $this->has('parent_id') 
                        ? $this->parent_id 
                        : ShopCategory::where('id', $this->route('id'))->value('parent_id');
                        
                    return $query->where('parent_id', $parentId);
                })->ignore($id),
            ],
            'description' => 'nullable|string',
            'parent_id' => 'nullable|integer|exists:shop_categories,id|different:id',
            'image_path' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}