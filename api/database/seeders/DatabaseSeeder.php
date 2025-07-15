<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use Database\Seeders\RawRequestCommissionSeeder; // <-- Důležité: Správný import
use Database\Seeders\UserLoginSeeder;            // <-- Důležité: Správný import

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // UserLoginSeeder::class,
            RawRequestCommissionSeeder::class, // <-- Volání správné třídy seederu
        ]);
    }
}