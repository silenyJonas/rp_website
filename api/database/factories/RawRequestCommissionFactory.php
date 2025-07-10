<?php

namespace Database\Factories;

use App\Models\RawRequestCommission;
use Database\Seeders\RawRequestCommissionSeeder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
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
            'thema' => $this->faker->sentence(rand(2, 4)), // Krátké téma
            'contact_email' => $this->faker->safeEmail(), // Bezpečný náhodný e-mail
            'contact_phone' => $this->faker->optional()->phoneNumber(), // Telefon (někdy null)
            'order_description' => $this->faker->paragraphs(rand(2, 4), true), // Delší popis objednávky
            'status' => $this->faker->randomElement(['Nově zadané', 'Zpracovává se', 'Dokončeno', 'Zrušeno']), // Náhodný stav
            'priority' => $this->faker->randomElement(['Nízká', 'Neutrální', 'Vysoká']), // Náhodná priorita
        ];
    }

}