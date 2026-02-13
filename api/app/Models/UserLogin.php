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
    protected $fillable = [
        'user_email',
        'contact_email',    
        'user_password_hash',
        'full_name',        
        'birth_date',       
        'personal_id_num',    
        'address',            
        'bank_account',       
        'health_insurance',   
        'commission_rate',    
        'dpp_hours_spent',    
        'has_tax_declaration',
        'phone_number',       
        'internal_note',      
        'last_login_at',
    ];

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