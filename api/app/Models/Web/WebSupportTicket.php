<?php

namespace App\Models\Web;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WebSupportTicket extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'user_name_plain',
        'user_plain',
        'category',
        'priority',
        'state',
        'subject',
        'description',
        'attachment_path'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Automatické nastavení výchozího stavu při vytvoření.
     */
    protected static function booted()
    {
        static::creating(function ($ticket) {
            if (empty($ticket->state)) {
                $ticket->state = 'new';
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}