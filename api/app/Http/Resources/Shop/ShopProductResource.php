<?php

namespace App\Http\Resources\Shop;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShopProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'supplier_id' => $this->supplier_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'price' => (float)$this->price,
            'cost_price' => (float)$this->cost_price,
            'sku' => $this->sku,
            'stock_quantity' => (int)$this->stock_quantity,
            'stock_warning_level' => (int)$this->stock_warning_level,
            'is_active' => (bool)$this->is_active,
            'is_featured' => (bool)$this->is_featured,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),

            // Načte celou kategorii k produktu
            'category' => new ShopCategoryResource($this->whenLoaded('category')),
        ];
    }
}