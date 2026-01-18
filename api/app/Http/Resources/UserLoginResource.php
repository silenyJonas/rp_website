<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserLoginResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->user_login_id,
            'user_email' => $this->user_email, // V UI se zobrazí jako Login
            'last_login_at' => $this->last_login_at,
            'is_deleted' => (bool) $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
            
            'roles' => RoleResource::collection($this->whenLoaded('roles')),

            // user_permissions se vrátí jen pokud jsou role načteny (Eager Loading)
            'user_permissions' => $this->whenLoaded('roles', function() {
                return $this->roles->flatMap(function ($role) {
                    // Kontrola, zda role má vztah permissions načtený
                    return $role->permissions ? $role->permissions->pluck('permission_key') : collect();
                })->unique()->values();
            }),
        ];
    }
}