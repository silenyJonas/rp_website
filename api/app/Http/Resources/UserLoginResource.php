<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserLoginResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->user_login_id,
            'user_email' => $this->user_email,
            'last_login_at' => $this->last_login_at,
            'is_deleted' => (bool) $this->is_deleted,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
        ];
    }
}