<?php

namespace App\Models\Web;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WebSalesLead extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'web_sales_leads';

    protected $fillable = [
        'user_id',
        'salesman_name',
        'first_contact_date',
        'subject_name',
        'contact_person',
        'contact_email',
        'contact_phone',
        'contact_other',
        'location',
        'source_channel',
        'source_url',
        'description',
        'priority',
        'status',
        'last_contact_date',
        'next_step',
        'rejection_reason'
    ];

    protected $casts = [
        'first_contact_date' => 'date',
        'last_contact_date'  => 'date',
        'created_at'         => 'datetime',
        'updated_at'         => 'datetime',
        'deleted_at'         => 'datetime',
    ];

    /**
     * Relace na uživatele (obchodníka), který lead spravuje.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relace na objednávky vytvořené z tohoto leadu.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(WebSalesOrder::class, 'lead_id');
    }
}