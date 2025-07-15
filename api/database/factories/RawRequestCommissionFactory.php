<?php

namespace Database\Factories;

use App\Models\RawRequestCommission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RawRequestCommission>
 */
class RawRequestCommissionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<\App\Models\RawRequestCommission>
     */
    protected $model = RawRequestCommission::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'thema' => $this->faker->sentence(rand(2, 4)),
            'contact_email' => $this->faker->unique()->safeEmail(),
            'contact_phone' => $this->faker->optional()->phoneNumber(),
            'order_description' => $this->faker->paragraphs(rand(2, 4), true),
            'status' => $this->faker->randomElement(['Nově zadané', 'Zpracovává se', 'Dokončeno', 'Zrušeno']),
            'priority' => $this->faker->randomElement(['Nízká', 'Neutrální', 'Vysoká']),
            // created_at, updated_at a deleted_at jsou automaticky spravovány Laravelem
            // díky timestamps() a softDeletes() v migraci a výchozímu chování modelu.
            // Není potřeba je zde definovat.
        ];
    }
}
