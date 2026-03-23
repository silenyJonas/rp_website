<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CorePermission extends Model
{
    protected $table = 'core_permissions';

    public $timestamps = false;

    protected $fillable = [
        'permission_key',
        'description'
    ];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_permissions', 'permission_id', 'role_id', 'id', 'id');
    }
}