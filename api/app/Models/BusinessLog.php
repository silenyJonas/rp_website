<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessLog extends Model
{
    use HasFactory;

    // Pokud se sloupec jmenuje prostě 'id', tento řádek smaž nebo zakomentuj:
    // protected $primaryKey = 'business_log_id'; 

    protected $table = 'web_logs';
    
    public $timestamps = false; // Necháváme, protože máš jen created_at

    protected $fillable = [
        'origin', 'event_type', 'module', 'description', 
        'affected_entity_type', 'affected_entity_id', 'user_id', 
        'context_data', 'user_id_plain', 'user_email_plain' // Opraveno z user_login_plain
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'context_data' => 'array', // Doporučuji castovat na array, pokud tam ukládáš JSON
    ];

    public function user()
    {
        // Opraveno: Tabulka se jmenuje User a klíče jsou id / user_id
        return $this->belongsTo(User::class, 'user_id');
    }
}