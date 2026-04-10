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
            'category' => new ShopCategoryResource($this->whenLoaded('category')),
            'supplier_id' => $this->supplier_id,
            'supplier' => new ShopSupplierResource($this->whenLoaded('supplier')),
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'price' => (float)$this->price,
            'cost_price' => $this->cost_price ? (float)$this->cost_price : null,
            'sku' => $this->sku,
            'stock_quantity' => $this->stock_quantity,
            'stock_warning_level' => $this->stock_warning_level,
            'is_active' => (bool)$this->is_active,
            'is_featured' => (bool)$this->is_featured,
            'primary_image' => new ShopProductImageResource($this->whenLoaded('primaryImage')),
            'images' => ShopProductImageResource::collection($this->whenLoaded('images')),
            'variants' => ShopProductVariantResource::collection($this->whenLoaded('variants')),
            'reviews_count' => $this->whenLoaded('reviews', fn() => $this->reviews->count()),
            'average_rating' => $this->whenLoaded('reviews', fn() => round($this->reviews->avg('rating'), 2)),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            'deleted_at' => $this->deleted_at ? $this->deleted_at->toIso8601String() : null,
        ];
    }
}