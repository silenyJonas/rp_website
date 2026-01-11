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
            'is_deleted' => (bool) $this->deleted_at, // Opraveno: is_deleted se většinou určuje podle přítomnosti deleted_at
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
            
            // Načtení rolí skrze RoleResource
            'roles' => RoleResource::collection($this->whenLoaded('roles')),

            /**
             * NOVÉ: user_permissions
             * Tato část projde všechny načtené role, vytáhne jejich oprávnění (permission_key),
             * sjednotí je do jednoho pole a odstraní duplicity.
             */
            'user_permissions' => $this->whenLoaded('roles', function() {
                return $this->roles->flatMap(function ($role) {
                    return $role->permissions->pluck('permission_key');
                })->unique()->values();
            }),
        ];
    }
}