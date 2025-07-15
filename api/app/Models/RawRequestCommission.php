<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 *
 * @property int $id
 * @property string $thema
 * @property string $contact_email
 * @property string|null $contact_phone
 * @property string $order_description
 * @property string $status
 * @property string $priority
 * @property Carbon $created_at
 * @property Carbon $updated_at // Nyní odkazuje na 'updated_at' v DB
 * @property Carbon|null $deleted_at
 * @method static \Database\Factories\RawRequestCommissionFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission whereContactEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission whereContactPhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission whereOrderDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission wherePriority($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission whereThema($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RawRequestCommission withoutTrashed()
 * @mixin \Eloquent
 */
class RawRequestCommission extends Model
{
    use HasFactory, SoftDeletes;

    // ODSTRANĚNO: const UPDATED_AT = 'last_changed_at';
    // Laravel nyní bude automaticky používat sloupec 'updated_at' v DB.

    // Ponecháno na true (nebo odstraněno, true je výchozí)
    public $timestamps = true;

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
        // Sloupce timestamps a softDeletes jsou spravovány automaticky
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime', // Změněno z last_changed_at
        'deleted_at' => 'datetime',
    ];

    // ... (další kód modelu) ...
}
