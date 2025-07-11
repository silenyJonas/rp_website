<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// use Illuminate\Database\Eloquent\SoftDeletes; // Pokud používáte SoftDeletes

class RawRequestCommission extends Model
{
    use HasFactory;
    // use SoftDeletes; // Pokud používáte SoftDeletes

    // Definujte název sloupce pro "updated at"
    const UPDATED_AT = 'last_changed_at'; // <-- PŘIDAT TENTO ŘÁDEK

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'thema',
        'contact_email',
        'contact_phone',
        'order_description',
        'status',
        'priority',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'is_deleted' => 'boolean',
        'created_at' => 'datetime',
        'last_changed_at' => 'datetime', // Doporučeno ponechat i když je to UPDATED_AT
        'deleted_at' => 'datetime',
    ];

    // ... (další kód modelu) ...
}