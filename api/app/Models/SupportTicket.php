<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SupportTicket extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'support_tickets';

    protected $fillable = [
        'user_login_id',
        'user_name_plain',
        'user_email_plain',
        'category',
        'priority',
        'state',
        'subject',
        'description',
        'attachment_path'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_login_id', 'user_login_id');
    }
}