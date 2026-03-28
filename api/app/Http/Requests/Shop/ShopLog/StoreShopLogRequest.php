<?php

namespace App\Http\Resources\Shop\ShopLog;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShopLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'origin' => $this->origin,
            'event_type' => $this->event_type,
            'module' => $this->module,
            'description' => $this->description,
            'affected_entity_type' => $this->affected_entity_type,
            'affected_entity_id' => (int)$this->affected_entity_id ?: null,
            'user_id' => $this->user_id,
            'user_id_plain' => $this->user_id_plain, // 🆕
            'user_plain' => $this->user_plain,       // 🆕
            'context_data' => $this->context_data,
            'created_at' => $this->created_at->toIso8601String(),
            
            // Načte relaci uživatele, pokud existuje
            'user' => $this->whenLoaded('user'),
        ];
    }
}