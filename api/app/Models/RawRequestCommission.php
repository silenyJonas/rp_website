<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// use Illuminate\Database\Eloquent\SoftDeletes; // Pokud používáte SoftDeletes

/**
 * 
 *
 * @property int $id
 * @property string $thema
 * @property string $contact_email
 * @property string|null $contact_phone
 * @property string $order_description
 * @property string $status
 * @property string $priority
 * @property \Illuminate\Support\Carbon $created_at
 * @property string $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property bool $is_deleted
 * @method static \Database\Factories\RawRequestCommissionFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission whereContactEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission whereContactPhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission whereIsDeleted($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission whereOrderDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission wherePriority($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission whereThema($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class RawRequestCommission extends Model
{
    use HasFactory;
    // use SoftDeletes; // Pokud používáte SoftDeletes

    // Definujte název sloupce pro "updated at"
    const UPDATED_AT = 'last_changed_at'; // <-- PŘIDAT TENTO ŘÁDEK

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'thema',
        'contact_email',
        'contact_phone',
        'order_description',
        'status',
        'priority',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'is_deleted' => 'boolean',
        'created_at' => 'datetime',
        'last_changed_at' => 'datetime', // Doporučeno ponechat i když je to UPDATED_AT
        'deleted_at' => 'datetime',
    ];

    // ... (další kód modelu) ...
}