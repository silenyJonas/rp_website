<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShopCategory extends Model
{
    use SoftDeletes;

    protected $table = 'shop_categories';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'parent_id',
        'image_path',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'parent_id' => 'integer',
    ];

    /**
     * Relace na produkty v této kategorii.
     */
    public function products(): HasMany
    {
        return $this->hasMany(ShopProduct::class, 'category_id');
    }

    /**
     * Relace na nadřazenou kategorii (pokud existuje).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(ShopCategory::class, 'parent_id');
    }

    /**
     * Relace na podkategorie.
     */
    public function children(): HasMany
    {
        return $this->hasMany(ShopCategory::class, 'parent_id')->orderBy('sort_order');
    }
}