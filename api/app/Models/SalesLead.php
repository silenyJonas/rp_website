<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalesLead extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_login_id',
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
        'expiration_date',
        'rejection_reason'
    ];

    protected $casts = [
        'first_contact_date' => 'date',
        'last_contact_date' => 'date',
        'expiration_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];
}