<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class RawRequestCommission extends Model
{
    use HasFactory, SoftDeletes;

    // ODSTRANĚNO: const UPDATED_AT = 'last_changed_at';
    // Laravel nyní bude automaticky používat sloupec 'updated_at' v DB.

    // Ponecháno na true (nebo odstraněno, true je výchozí)
    public $timestamps = true;

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
        // Sloupce timestamps a softDeletes jsou spravovány automaticky
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime', // Změněno z last_changed_at
        'deleted_at' => 'datetime',
    ];

    // ... (další kód modelu) ...
}
