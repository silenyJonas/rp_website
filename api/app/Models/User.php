<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // <--- Důležité: Přidat tento use statement pro Sanctum

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; // <--- Přidat HasApiTokens sem

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'user_login'; // <-- ZMĚNA: Název tvé tabulky pro přihlášení

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'user_login_id'; // <-- ZMĚNA: Tvůj primární klíč

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_email',         // <-- ZMĚNA: Tvůj sloupec pro e-mail
        'user_password_hash', // <-- ZMĚNA: Tvůj sloupec pro hash hesla
        'user_password_salt', // <--- Přidat, pokud používáš salt samostatně
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'user_password_hash', // <-- ZMĚNA: Skrýt hash hesla
        'user_password_salt', // <-- ZMĚNA: Skrýt salt
        // 'remember_token',   // Můžeš zakomentovat, pokud ho nemáš v DB
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // 'email_verified_at' => 'datetime', // Můžeš zakomentovat, pokud nepoužíváš ověření e-mailu
        'last_login_at' => 'datetime',       // <-- Přidat, pokud máš
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',          // <-- Přidat, pokud máš
        'is_deleted' => 'boolean',           // <-- Přidat, pokud máš
        // 'password' => 'hashed', // <-- TOTO ODSTRANIT! Tvoji metodu getAuthPassword() použijeme pro hash hesla
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
        return 'user_email'; // <-- ZMĚNA: Tvůj sloupec pro e-mail
    }

    /**
     * Get the unique identifier for the user.
     *
     * @return mixed
     */
    public function getAuthIdentifier()
    {
        return $this->user_email; // <-- ZMĚNA: Vracíme hodnotu z tvého e-mailového sloupce
    }

    /**
     * Get the password for the user.
     * Laravel volá tuto metodu, když potřebuje porovnat heslo.
     *
     * @return string
     */
    public function getAuthPassword()
    {
        return $this->user_password_hash; // <-- ZMĚNA: Tvůj sloupec s hashovaným heslem
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