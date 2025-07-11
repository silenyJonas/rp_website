<?php

namespace Database\Factories;

use App\Models\User; // Důležité: Tady referencujeme tvůj model App\Models\User
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<\App\Models\User>
     */
    protected $model = User::class; // <<<<< Ujisti se, že toto odkazuje na tvůj App\Models\User

    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // <<<<< ZMĚNA: Používáme user_email a user_password_hash
            'user_email' => $this->faker->unique()->safeEmail(),
            'user_password_hash' => static::$password ??= Hash::make('password'),
            'user_password_salt' => '', // Bcrypt integruje salt, takže může být prázdné
            'last_login_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
            'deleted_at' => null,
            'is_deleted' => false,
            // 'remember_token' => Str::random(10), // <<<<< Pokud nemáš v DB, zakomentuj
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
                // 'email_verified_at' => null, // <<<<< Pokud nemáš, zakomentuj
        ]);
    }
}