<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RawRequestCommissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'thema' => $this->thema,
            'contact_email' => $this->contact_email,
            'contact_phone' => $this->contact_phone,
            'order_description' => $this->order_description,
            'status' => $this->status,
            'priority' => $this->priority,
            'created_at' => $this->created_at,
            'last_changed_at' => $this->last_changed_at,
            'deleted_at' => $this->deleted_at,
            'is_deleted' => (bool) $this->is_deleted,
        ];
    }
}
