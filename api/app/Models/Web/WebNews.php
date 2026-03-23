<?php

namespace App\Models\Web;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WebNews extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'web_news';
    protected $fillable = [
        'title',
        'message',
        'author',
        'thema',
        'bullet_1',
        'bullet_2',
        'bullet_3',
        'bullet_4'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];
}