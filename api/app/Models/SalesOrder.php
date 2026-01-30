<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SalesOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'sales_orders';

    protected $fillable = [
        'lead_id',
        'salesman_name',
        'ico',
        'client_name',
        'client_address',
        'client_phone',
        'client_email',
        'order_description'
    ];

    /**
     * Vazba na původní lead
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(SalesLead::class, 'lead_id');
    }
}