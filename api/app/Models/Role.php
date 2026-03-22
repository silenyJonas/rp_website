<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany; // <--- Přidán import pro typování

class Role extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'core_roles';

    // Pokud se sloupec v migraci jmenuje 'id', primaryKey definovat nemusíš.
    // Pokud se jmenuje 'role_id', odkomentuj toto:
    // protected $primaryKey = 'role_id';

    protected $fillable = [
        'role_name', 
        'description'
    ];

    /**
     * Vztah k uživatelům (M:N)
     */
    public function users(): BelongsToMany
    {
        // Předpokládám tabulku user_roles jako propojovací
        return $this->belongsToMany(User::class, 'user_roles', 'role_id', 'user_id');
    }

    /**
     * Vztah k oprávněním (M:N) - pokud jej používáš
     */
    public function permissions(): BelongsToMany
    {
        // Přidáváme pátý parametr 'id', což je název klíče v tabulce permissions
        return $this->belongsToMany(
            Permission::class, 
            'core_role_permissions', 
            'role_id', 
            'permission_id', 
            'id' 
        );
    }
}