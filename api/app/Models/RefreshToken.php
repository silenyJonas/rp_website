<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RefreshToken extends Model
{
    use HasFactory;

    protected $table = 'refresh_tokens';

    protected $fillable = [
        'user_id',    // Změněno z user_login_id na user_id
        'token',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    /**
     * Vztah k uživateli
     */
    public function user(): BelongsTo
    {
        // Předpokládáme, že v tabulce refresh_tokens je 'user_id' 
        // a v tabulce users je primární klíč 'id'
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}