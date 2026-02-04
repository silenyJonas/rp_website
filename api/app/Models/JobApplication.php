<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class JobApplication extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'job_applications';

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'position_name',
        'message',
        'cv_path',
        'state',
        'internal_note'
    ];
}