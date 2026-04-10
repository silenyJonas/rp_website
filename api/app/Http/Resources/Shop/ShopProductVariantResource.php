<?php

namespace App\Http\Resources\Shop;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShopProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'variant_name' => $this->variant_name,
            'attribute_1_name' => $this->attribute_1_name,
            'attribute_1_value' => $this->attribute_1_value,
            'attribute_2_name' => $this->attribute_2_name,
            'attribute_2_value' => $this->attribute_2_value,
            'sku_variant' => $this->sku_variant,
            'price_modifier' => (float)$this->price_modifier,
            'stock_quantity' => $this->stock_quantity,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            'deleted_at' => $this->deleted_at ? $this->deleted_at->toIso8601String() : null,
        ];
    }
}