<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends Model
{
    protected $table = 'permissions';
    // protected $primaryKey = 'permission_id'; // <--- TOTO JSME ODSTRANILI

    public $timestamps = false;

    protected $fillable = [
        'permission_key',
        'description'
    ];

    public function roles(): BelongsToMany
    {
        // Definice relace:
        // 'permission_id' je sloupec v pivot tabulce role_permissions
        // 'id' je primární klíč v tabulce permissions
        return $this->belongsToMany(Role::class, 'role_permissions', 'permission_id', 'role_id', 'id', 'id');
    }
}