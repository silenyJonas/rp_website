<?php


namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;


class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'user_login';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'user_login_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_email',
        'user_password_hash',
        'user_password_salt',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'user_password_hash',
        'user_password_salt',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'last_login_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'last_changed_at' => 'datetime',
        'deleted_at' => 'datetime',
        'is_deleted' => 'boolean',
    ];

    /**
     * Definice vztahu M:N s modelem Role.
     * Vztah je upraven tak, aby používal správný sloupec v pivotní tabulce.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_login_id', 'role_id');
    }

    // --- KLÍČOVÉ METODY PRO AUTENTIZACI ---

    /**
     * Get the name of the unique identifier for the user.
     * Toto je sloupec, který Laravel použije jako "username" při pokusu o přihlášení.
     *
     * @return string
     */
    public function getAuthIdentifierName()
    {
        return 'user_email';
    }

    /**
     * Get the unique identifier for the user.
     *
     * @return mixed
     */
    public function getAuthIdentifier()
    {
        return $this->user_email;
    }

    /**
     * Get the password for the user.
     * Laravel volá tuto metodu, když potřebuje porovnat heslo.
     *
     * @return string
     */
    public function getAuthPassword()
    {
        return $this->user_password_hash;
    }

    /**
     * Get the column name for the "remember me" token.
     * Pokud nemáš remember_token sloupec, nastav na null.
     *
     * @return string|null
     */
    public function getRememberTokenName()
    {
        return null;
    }

    /**
     * Overwrite `setPasswordAttribute` to handle `user_password_hash`
     *
     * @param string $value
     * @return void
     */
    public function setPasswordAttribute($value)
    {
        $this->attributes['user_password_hash'] = \Illuminate\Support\Facades\Hash::make($value);
    }
}
