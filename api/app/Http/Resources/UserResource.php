<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Použijeme accessor definovaný v modelu User
        $perms = $this->permissions;

        return [
            'id'                    => $this->id,
            'user_email'            => $this->user_email,
            'contact_email'         => $this->contact_email,
            'full_name'             => $this->full_name,
            'birth_date'            => $this->birth_date?->format('Y-m-d'),
            'personal_id_num'       => $this->personal_id_num,
            'address'               => $this->address,
            'bank_account'          => $this->bank_account,
            'health_insurance'      => $this->health_insurance,
            'commission_rate'       => (int) $this->commission_rate,
            'dpp_hours_spent'       => (int) $this->dpp_hours_spent,
            'has_tax_declaration'   => (bool) $this->has_tax_declaration,
            'phone_number'          => $this->phone_number,
            'internal_note'         => $this->internal_note,
            'last_login_at'         => $this->last_login_at?->format('Y-m-d H:i:s'),
            'created_at'            => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'            => $this->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at'            => $this->deleted_at?->format('Y-m-d H:i:s'),
            
            'role_id'               => $this->roles->first()?->id,
            
            // Relace (pouze pokud jsou načtené)
            'roles'                 => RoleResource::collection($this->whenLoaded('roles')),
            
            // Pro Angular AuthService a PermissionService
            'user_permissions'      => $perms,
            'permissions'           => $perms,
        ];
    }
}