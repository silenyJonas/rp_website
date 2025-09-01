<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessLog extends Model
{
    use HasFactory;

    // Nastavíme název primárního klíče
    protected $primaryKey = 'business_log_id';

    // Zakážeme automatickou správu timestamps, protože ji máme definovanou v databázi
    public $timestamps = false;

    // Nastavení, které atributy lze hromadně přiřadit
    protected $fillable = [
        'origin',
        'event_type',
        'module',
        'description',
        'affected_entity_type',
        'affected_entity_id',
        'user_login_id',
        'context_data',
        'user_login_id_plain',
        'user_login_email_plain'
    ];

    /**
     * Definování relace s modelem UserLogin.
     */
    public function user()
    {
        return $this->belongsTo(UserLogin::class, 'user_login_id', 'user_login_id');
    }
}