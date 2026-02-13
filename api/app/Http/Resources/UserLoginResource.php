<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserLoginResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->user_login_id,
            'user_email'            => $this->user_email,
            'contact_email'         => $this->contact_email,
            'full_name'             => $this->full_name,
            'birth_date'            => $this->birth_date,
            'personal_id_num'       => $this->personal_id_num,
            'address'               => $this->address,
            'bank_account'          => $this->bank_account,
            'health_insurance'      => $this->health_insurance,
            'commission_rate'       => (int) $this->commission_rate,
            'dpp_hours_spent'       => (int) $this->dpp_hours_spent,
            'has_tax_declaration'   => (bool) $this->has_tax_declaration,
            'phone_number'          => $this->phone_number,
            'internal_note'         => $this->internal_note,
            'last_login_at'         => $this->last_login_at,
            'is_deleted'            => (bool) $this->is_deleted,
            'created_at'            => $this->created_at,
            'updated_at'            => $this->updated_at,
            'deleted_at'            => $this->deleted_at,
            'roles'                 => RoleResource::collection($this->whenLoaded('roles')),
            'user_permissions'      => $this->whenLoaded('roles', function() {
                return $this->roles->flatMap(function ($role) {
                    return $role->permissions ? $role->permissions->pluck('permission_key') : collect();
                })->unique()->values();
            }),
        ];
    }
}