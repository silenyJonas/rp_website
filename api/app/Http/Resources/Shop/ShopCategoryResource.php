<?php

namespace App\Http\Resources\Shop;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShopCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'parent_id' => $this->parent_id,
            'image_path' => $this->image_path,
            'image_url' => $this->image_path ? asset('storage/' . $this->image_path) : null,
            'is_active' => (bool)$this->is_active,
            'sort_order' => (int)$this->sort_order,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            
            // Načte podkategorie pouze, pokud jsi je v controlleru vytáhl pomocí with('children')
            'children' => ShopCategoryResource::collection($this->whenLoaded('children')),
            'parent' => new ShopCategoryResource($this->whenLoaded('parent')),
        ];
    }
}