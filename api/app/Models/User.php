<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;


class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    protected $table = 'user_login';
    protected $primaryKey = 'user_login_id';
    protected $fillable = [
        'user_email',
        'user_password_hash',
        'user_password_salt',
        'last_login_at',
    ];

    protected $hidden = [
        'user_password_hash',
        'user_password_salt',
    ];

    protected $casts = [
        'last_login_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'last_changed_at' => 'datetime',
        'deleted_at' => 'datetime',
        'is_deleted' => 'boolean',
    ];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_login_id', 'role_id');
    }

    public function getAuthIdentifierName()
    {
        return 'user_email';
    }

    public function getAuthIdentifier()
    {
        return $this->user_email;
    }

    public function getAuthPassword()
    {
        return $this->user_password_hash;
    }

    public function getRememberTokenName()
    {
        return null;
    }

    public function setPasswordAttribute($value)
    {
        $this->attributes['user_password_hash'] = \Illuminate\Support\Facades\Hash::make($value);
    }
}
