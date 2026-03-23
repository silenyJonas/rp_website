<?php

namespace App\Http\Resources\Web;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WebJobApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'first_name'    => $this->first_name,
            'last_name'     => $this->last_name,
            'full_name'     => "{$this->first_name} {$this->last_name}",
            'email'         => $this->email,
            'phone'         => $this->phone,
            'position_name' => $this->position_name,
            'message'       => $this->message,
            'cv_path'       => $this->cv_path,
            'cv_url'        => $this->cv_path ? asset('storage/' . $this->cv_path) : null,
            'state'         => $this->state,
            'internal_note' => $this->internal_note,
            'created_at'    => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'    => $this->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at'    => $this->deleted_at?->format('Y-m-d H:i:s'),
        ];
    }
}