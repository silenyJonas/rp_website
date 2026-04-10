<?php

namespace App\Http\Requests\Shop\ShopProduct;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShopProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('id');

        return [
            // Základní informace
            'category_id' => 'required|integer|exists:shop_categories,id',
            'supplier_id' => 'nullable|integer|exists:shop_suppliers,id',
            'name' => 'required|string|max:200',
            'slug' => 'nullable|string|max:200|unique:shop_products,slug,' . $productId,
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',

            // Ceny a skladové zásoby
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|max:50|unique:shop_products,sku,' . $productId,
            'stock_quantity' => 'nullable|integer|min:0',
            'stock_warning_level' => 'nullable|integer|min:0',

            // Status
            'is_active' => 'boolean',
            'is_featured' => 'boolean',

            // Obrázky
            'images' => 'nullable|array|max:10',
            'images.*.id' => 'nullable|integer|exists:shop_product_images,id',
            'images.*.file' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'images.*.alt_text' => 'nullable|string|max:200',
            'images.*.is_primary' => 'boolean',
            'images.*.sort_order' => 'nullable|integer|min:0',
            'delete_images' => 'nullable|array',
            'delete_images.*' => 'integer|exists:shop_product_images,id',

            // Varianty
            'variants' => 'nullable|array|max:50',
            'variants.*.id' => 'nullable|integer|exists:shop_product_variants,id',
            'variants.*.variant_name' => 'required_with:variants|string|max:100',
            'variants.*.attribute_1_name' => 'nullable|string|max:50',
            'variants.*.attribute_1_value' => 'nullable|string|max:100',
            'variants.*.attribute_2_name' => 'nullable|string|max:50',
            'variants.*.attribute_2_value' => 'nullable|string|max:100',
            'variants.*.sku_variant' => 'nullable|string|max:50|unique:shop_product_variants,sku_variant,id',
            'variants.*.price_modifier' => 'nullable|numeric',
            'variants.*.stock_quantity' => 'nullable|integer|min:0',
            'delete_variants' => 'nullable|array',
            'delete_variants.*' => 'integer|exists:shop_product_variants,id',
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'Kategorie je povinná.',
            'category_id.exists' => 'Vybraná kategorie neexistuje.',
            'name.required' => 'Název produktu je povinný.',
            'price.required' => 'Cena je povinná.',
            'price.numeric' => 'Cena musí být číslo.',
            'images.*.file.image' => 'Soubor musí být obrázek.',
            'images.*.file.max' => 'Obrázek je příliš velký (max 5MB).',
            'variants.*.sku_variant.unique' => 'Varianta SKU už existuje.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Automaticky generovat slug z názvu, pokud se změní
        if ($this->filled('name') && (!$this->filled('slug') || $this->has('auto_slug'))) {
            $this->merge([
                'slug' => $this->generateSlug($this->input('name')),
            ]);
        }

        // Nastav výchozí hodnoty
        $this->merge([
            'is_active' => $this->boolean('is_active'),
            'is_featured' => $this->boolean('is_featured'),
            'stock_quantity' => $this->input('stock_quantity', 0),
            'stock_warning_level' => $this->input('stock_warning_level', 10),
        ]);
    }

    /**
     * Generuje slug z názvu
     */
    private function generateSlug(string $name): string
    {
        return \Illuminate\Support\Str::slug($name, '-');
    }
}