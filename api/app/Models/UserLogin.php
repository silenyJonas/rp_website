<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class UserLogin extends Model
{
    use HasFactory, Notifiable, SoftDeletes;
    
    protected $primaryKey = 'user_login_id';
    protected $table = 'user_login';

    /**
     * Pole, která lze hromadně přiřazovat.
     */
    protected $fillable = [
        'user_email',
        'contact_email',      // NOVÉ
        'user_password_hash',
        'full_name',          // NOVÉ
        'birth_date',         // NOVÉ
        'personal_id_num',    // NOVÉ
        'address',            // NOVÉ
        'bank_account',       // NOVÉ
        'health_insurance',   // NOVÉ
        'commission_rate',    // NOVÉ
        'dpp_hours_spent',    // NOVÉ
        'has_tax_declaration',// NOVÉ
        'phone_number',       // NOVÉ
        'internal_note',      // NOVÉ
        'last_login_at',
    ];

    /**
     * Přetypování atributů.
     */
    protected $casts = [
        'last_login_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
        'birth_date' => 'date',
        'has_tax_declaration' => 'boolean',
        'commission_rate' => 'integer',
        'dpp_hours_spent' => 'integer',
    ];

    protected $hidden = [
        'user_password_hash',
    ];
    
    public $incrementing = true;
    protected $keyType = 'int';

    /**
     * Vztah k rolím (M:N)
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_login_id', 'role_id');
    }

    /**
     * POMOCNÁ METODA: Získá unikátní seznam klíčů oprávnění pro tohoto uživatele.
     */
    public function getPermissionsAttribute()
    {
        return $this->roles()->with('permissions')->get()
            ->flatMap(function ($role) {
                return $role->permissions;
            })
            ->pluck('permission_key')
            ->unique()
            ->values();
    }

    /**
     * Helper pro rychlou kontrolu oprávnění přímo v PHP/Laravelu
     */
    public function hasPermission(string $permission): bool
    {
        return $this->permissions->contains($permission);
    }
}