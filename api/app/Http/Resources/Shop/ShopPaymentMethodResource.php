<?php

namespace App\Http\Resources\Shop;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShopPaymentMethodResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'provider' => $this->provider,
            'is_external' => (bool)$this->is_external,
            'bank_account_number' => $this->bank_account_number,
            'bank_account_code' => $this->bank_account_code,
            'bank_iban' => $this->bank_iban,
            'bank_swift_bic' => $this->bank_swift_bic,
            'variable_symbol_type' => $this->variable_symbol_type,
            'is_active' => (bool)$this->is_active,
            'sort_order' => (int)$this->sort_order,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            'deleted_at' => $this->deleted_at ? $this->deleted_at->toIso8601String() : null,
        ];
    }
}