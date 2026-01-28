<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class News extends Model
{
    use HasFactory, SoftDeletes;

    // Explicitní název tabulky
    protected $table = 'news';

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