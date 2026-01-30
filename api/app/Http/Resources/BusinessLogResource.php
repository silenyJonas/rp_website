<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusinessLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'business_log_id'        => $this->business_log_id,
            'created_at'             => $this->created_at?->format('Y-m-d H:i:s'),
            'origin'                 => $this->origin,
            'event_type'             => $this->event_type,
            'module'                 => $this->module,
            'description'            => $this->description,
            'affected_entity_type'   => $this->affected_entity_type,
            'affected_entity_id'     => $this->affected_entity_id,
            'user_login_id'          => $this->user_login_id,
            'context_data'           => json_decode($this->context_data, true) ?? $this->context_data,
            'user_login_id_plain'    => $this->user_login_id_plain,
            'user_login_email_plain' => $this->user_login_email_plain,
        ];
    }
}