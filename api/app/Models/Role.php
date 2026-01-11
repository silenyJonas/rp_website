<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'roles';
    protected $primaryKey = 'role_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'role_name',
        'description',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Vztah k uživatelům (M:N)
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(UserLogin::class, 'user_roles', 'role_id', 'user_login_id');
    }

    /**
     * NOVÉ: Vztah k oprávněním (M:N)
     * Propojuje model Role s modelem Permission skrze tabulku role_permissions.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permissions', 'role_id', 'permission_id');
    }
}