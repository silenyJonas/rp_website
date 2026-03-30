<?php

namespace App\Http\Resources\Shop;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

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
            'is_active' => (bool)$this->is_active,
            'sort_order' => $this->sort_order,
            
            // Oprava: Zajistíme, že i když je datum string, převedeme ho na Carbon před formátováním
            'created_at' => $this->created_at ? Carbon::parse($this->created_at)->toIso8601String() : null,
            'updated_at' => $this->updated_at ? Carbon::parse($this->updated_at)->toIso8601String() : null,
            
            'parent_name' => $this->parent?->name,
            'children' => ShopCategoryResource::collection($this->whenLoaded('children')),
        ];
    }
}