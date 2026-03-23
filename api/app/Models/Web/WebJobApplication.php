<?php

namespace App\Models\Web;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WebJobApplication extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'web_job_applications';

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