<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // <-- Důležité: Tento use statement je správný a potřebný

/**
 * 
 *
 * @property int $user_login_id
 * @property string $user_email
 * @property string $user_password_hash
 * @property string $user_password_salt
 * @property \Illuminate\Support\Carbon|null $last_login_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property bool $is_deleted
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereIsDeleted($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLastLoginAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUserEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUserLoginId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUserPasswordHash($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUserPasswordSalt($value)
 * @mixin \Eloquent
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; // <-- Použití traitu HasApiTokens je správné

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'user_login'; // <-- Název vaší tabulky pro přihlášení

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'user_login_id'; // <-- Váš primární klíč

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_email',           // <-- Váš sloupec pro e-mail
        'user_password_hash',   // <-- Váš sloupec pro hash hesla
        'user_password_salt',   // <--- Pokud používáte salt samostatně
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'user_password_hash', // <-- Skrýt hash hesla
        'user_password_salt', // <-- Skrýt salt
        // 'remember_token',   // Můžeš zakomentovat, pokud ho nemáš v DB
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // 'email_verified_at' => 'datetime', // Můžeš zakomentovat, pokud nepoužíváš ověření e-mailu
        'last_login_at' => 'datetime',        // <-- Pokud máte
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',           // <-- Pokud máte
        'is_deleted' => 'boolean',            // <-- Pokud máte
        // 'password' => 'hashed', // <-- TOTO ODSTRANIT! Vaši metodu getAuthPassword() použijeme pro hash hesla
    ];

    // --- KLÍČOVÉ METODY PRO AUTENTIZACI ---

    /**
     * Get the name of the unique identifier for the user.
     * Toto je sloupec, který Laravel použije jako "username" při pokusu o přihlášení.
     *
     * @return string
     */
    public function getAuthIdentifierName()
    {
        return 'user_email'; // <-- Váš sloupec pro e-mail
    }

    /**
     * Get the unique identifier for the user.
     *
     * @return mixed
     */
    public function getAuthIdentifier()
    {
        return $this->user_email; // <-- Vracíme hodnotu z vašeho e-mailového sloupce
    }

    /**
     * Get the password for the user.
     * Laravel volá tuto metodu, když potřebuje porovnat heslo.
     *
     * @return string
     */
    public function getAuthPassword()
    {
        return $this->user_password_hash; // <-- Váš sloupec s hashovaným heslem
    }

    /**
     * Get the column name for the "remember me" token.
     * Pokud nemáš remember_token sloupec, nastav na null.
     *
     * @return string|null
     */
    public function getRememberTokenName()
    {
        return null; // <--- DŮLEŽITÉ: Nastavit na null, pokud nemáš 'remember_token' sloupec
    }

    // Volitelné: Metoda pro automatické hashování hesla při nastavení
    // Pokud hesla hashujes už při vkládání do DB, není nutné ji mít.
    // protected function setPasswordAttribute($value)
    // {
    //    $this->attributes['user_password_hash'] = Hash::make($value);
    // }
}
