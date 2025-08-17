<?php

// namespace App\Models;

// use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Illuminate\Database\Eloquent\Model;
// use Illuminate\Database\Eloquent\Relations\BelongsToMany;
// use Illuminate\Database\Eloquent\SoftDeletes;
// use Illuminate\Notifications\Notifiable;

// class UserLogin extends Model
// {
//     // Používáme HasFactory, Notifiable a SoftDeletes
//     use HasFactory, Notifiable, SoftDeletes;
    
//     // Explicitně definujeme vlastní primární klíč
//     protected $primaryKey = 'user_login_id';

//     /**
//      * The table associated with the model.
//      *
//      * @var string
//      */
//     protected $table = 'user_login';

//     /**
//      * The attributes that are mass assignable.
//      *
//      * @var array
//      */
//     protected $fillable = [
//         'user_email',
//         'user_password_hash',
//         'user_password_salt', // Zachováváme pole z původního modelu
//         'last_login_at',
//         'is_deleted', // Zachováváme pole z původního modelu
//     ];

//     /**
//      * The attributes that should be cast to native types.
//      *
//      * @var array
//      */
//     protected $casts = [
//         'last_login_at' => 'datetime',
//         'created_at' => 'datetime',
//         'updated_at' => 'datetime',
//         'deleted_at' => 'datetime',
//     ];

//     /**
//      * The attributes that should be hidden for serialization.
//      *
//      * @var array
//      */
//     protected $hidden = [
//         'user_password_hash',
//         'user_password_salt', // Zachováváme pole z původního modelu
//     ];

//     /**
//      * Vrací název klíče, který se má použít pro Route Model Binding.
//      * Toto je klíčová úprava pro opravu chyby 500.
//      *
//      * @return string
//      */
//     public function getRouteKeyName(): string
//     {
//         return 'user_login_id';
//     }

//     /**
//      * Get the roles associated with the user.
//      */
//     public function roles(): BelongsToMany
//     {
//         // Upravujeme název pivot tabulky na 'user_roles' podle vašeho původního kódu
//         return $this->belongsToMany(Role::class, 'user_roles', 'user_login_id', 'role_id');
//     }
// }


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class UserLogin extends Model
{
    // Používáme HasFactory, Notifiable a SoftDeletes
    use HasFactory, Notifiable, SoftDeletes;
    
    // Explicitně definujeme vlastní primární klíč
    protected $primaryKey = 'user_login_id';

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'user_login';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_email',
        'user_password_hash',
        'last_login_at',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'last_login_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array
     */
    protected $hidden = [
        'user_password_hash',
    ];
    
    // Nové nastavení klíče
    public $incrementing = true;
    
    // Nový klíč pro cizí klíč
    protected $keyType = 'int';

    /**
     * Get the roles associated with the user.
     */
    public function roles(): BelongsToMany
    {
        // Vztah belongsToMany s modelem Role
        return $this->belongsToMany(Role::class, 'user_roles', 'user_login_id', 'role_id');
    }
}
