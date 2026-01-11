<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends Model
{
    // Název tabulky, kterou jsi vytvořil v SQL
    protected $table = 'permissions';
    
    // Primární klíč tabulky
    protected $primaryKey = 'permission_id';

    // Zakážeme automatické timestamps, pokud je v DB nemáš (v SQL dumpu vidím jen created_at)
    // Pokud chceš, aby Laravel spravoval updated_at, musíš ho mít v tabulce.
    public $timestamps = false;

    protected $fillable = [
        'permission_key',
        'description'
    ];

    /**
     * Vztah zpět k rolím
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_permissions', 'permission_id', 'role_id');
    }
}