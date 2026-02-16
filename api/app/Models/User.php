<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $table = 'users';

    protected $fillable = [
        'user_email', 'contact_email', 'user_password_hash', 'full_name',
        'birth_date', 'personal_id_num', 'address', 'bank_account',
        'health_insurance', 'commission_rate', 'dpp_hours_spent',
        'has_tax_declaration', 'phone_number', 'internal_note', 'last_login_at',
    ];

    protected $hidden = ['user_password_hash'];

    // Toto zajistí, že permissions budou součástí modelu i při převodu na pole/JSON
    protected $appends = ['permissions'];

    protected $casts = [
        'last_login_at' => 'datetime',
        'birth_date' => 'date',
        'has_tax_declaration' => 'boolean',
    ];

    public function getAuthPassword() { return $this->user_password_hash; }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id');
    }

    /**
     * Získá unikátní seznam klíčů oprávnění přes všechny role uživatele.
     */
    public function getPermissionsAttribute(): array
    {
        return $this->roles->flatMap(function ($role) {
            return $role->permissions;
        })->pluck('permission_key')->unique()->values()->toArray();
    }
}