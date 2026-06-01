<?php

namespace App\Http\Requests\Shop\ShopProduct;

use Illuminate\Foundation\Http\FormRequest;

class StoreShopProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Základní informace
            'category_id' => 'required|integer|exists:shop_categories,id',
            'supplier_id' => 'nullable|integer|exists:shop_suppliers,id',
            'name' => 'required|string|max:200',
            'slug' => 'nullable|string|max:200|unique:shop_products,slug',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',

            // Multi-měnové ceny pro hlavní produkt (Striktně > 0)
            'prices' => 'required|array',
            'prices.vat_rate' => 'required|numeric|min:0', // Sazba DPH může být 0 %
            'prices.price_czk_without_vat' => 'required|numeric|gt:0', // 🛡️ Větší než 0
            'prices.price_czk_with_vat' => 'required|numeric|gt:0',    // 🛡️ Větší než 0
            'prices.price_eur_without_vat' => 'nullable|numeric|gt:0',
            'prices.price_eur_with_vat' => 'nullable|numeric|gt:0',
            'prices.price_usd_without_vat' => 'nullable|numeric|gt:0',
            'prices.price_usd_with_vat' => 'nullable|numeric|gt:0',

            // Skladové zásoby
            'sku' => 'nullable|string|max:50|unique:shop_products,sku',
            'stock_quantity' => 'nullable|integer|min:0',
            'stock_warning_level' => 'nullable|integer|min:0',

            // Status
            'is_active' => 'boolean',
            'is_featured' => 'boolean',

            // Obrázky
            'images' => 'nullable|array|max:10',
            'images.*.file' => 'required_with:images|image|mimes:jpeg,png,jpg,webp|max:5120',
            'images.*.alt_text' => 'nullable|string|max:200',
            'images.*.is_primary' => 'boolean',
            'images.*.sort_order' => 'nullable|integer|min:0',

            // Varianty
            'variants' => 'nullable|array|max:50',
            'variants.*.variant_name' => 'required_with:variants|string|max:100',
            'variants.*.attribute_1_name' => 'nullable|string|max:50',
            'variants.*.attribute_1_value' => 'nullable|string|max:100',
            'variants.*.attribute_2_name' => 'nullable|string|max:50',
            'variants.*.attribute_2_value' => 'nullable|string|max:100',
            'variants.*.sku_variant' => 'nullable|string|max:50|unique:shop_product_variants,sku_variant',
            'variants.*.stock_quantity' => 'nullable|integer|min:0',

            // Multi-měnové ceny pro varianty (Striktně > 0)
            'variants.*.prices' => 'required_with:variants|array',
            'variants.*.prices.vat_rate' => 'required_with:variants.*.prices|numeric|min:0',
            'variants.*.prices.price_czk_without_vat' => 'required_with:variants.*.prices|numeric|gt:0', // 🛡️ Větší než 0
            'variants.*.prices.price_czk_with_vat' => 'required_with:variants.*.prices|numeric|gt:0',    // 🛡️ Větší než 0
            'variants.*.prices.price_eur_without_vat' => 'nullable|numeric|gt:0',
            'variants.*.prices.price_eur_with_vat' => 'nullable|numeric|gt:0',
            'variants.*.prices.price_usd_without_vat' => 'nullable|numeric|gt:0',
            'variants.*.prices.price_usd_with_vat' => 'nullable|numeric|gt:0',
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'Kategorie je povinná.',
            'category_id.exists' => 'Vybraná kategorie neexistuje.',
            'name.required' => 'Název produktu je povinný.',
            'prices.price_czk_without_vat.required' => 'Cena v CZK bez DPH je povinná.',
            'prices.price_czk_without_vat.gt' => 'Cena v CZK bez DPH musí být větší než 0.', // Přidáno pro lepší UX
            'prices.price_czk_with_vat.gt' => 'Cena v CZK s DPH musí být větší než 0.',       // Přidáno pro lepší UX
            'images.*.file.image' => 'Soubor musí být obrázek.',
            'images.*.file.max' => 'Obrázek je příliš velký (max 5MB).',
            'variants.*.sku_variant.unique' => 'Varianta SKU už existuje.',
            'variants.*.prices.price_czk_with_vat.gt' => 'Cena varianty s DPH musí být větší než 0.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('name') && !$this->filled('slug')) {
            $this->merge([
                'slug' => $this->generateSlug($this->input('name')),
            ]);
        }

        $this->merge([
            'is_active' => $this->boolean('is_active'),
            'is_featured' => $this->boolean('is_featured'),
            'stock_quantity' => $this->input('stock_quantity', 0),
            'stock_warning_level' => $this->input('stock_warning_level', 10),
        ]);
    }

    private function generateSlug(string $name): string
    {
        return \Illuminate\Support\Str::slug($name, '-');
    }
}