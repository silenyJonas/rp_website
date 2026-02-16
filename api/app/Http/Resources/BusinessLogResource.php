<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusinessLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                     => $this->id, // Změna z business_log_id
            'origin'                 => $this->origin,
            'event_type'             => $this->event_type,
            'module'                 => $this->module,
            'description'            => $this->description,
            'affected_entity_type'   => $this->affected_entity_type,
            'affected_entity_id'     => $this->affected_entity_id,
            'user' => [
                'id'         => $this->user_id,
                'user_email' => $this->user ? $this->user->user_email : 'Neznámý uživatel'
            ],
            'context_data'           => $this->context_data,
            'created_at'             => $this->created_at?->format('Y-m-d H:i:s'),
            'user_id_plain'          => $this->user_id_plain,
            'user_email_plain'       => $this->user_email_plain,
        ];
    }
}