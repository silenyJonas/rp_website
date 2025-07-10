<?php

namespace Database\Seeders;

use App\Models\RawRequestCommission; // Důležité: importovat model Product
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        RawRequestCommission::factory()->count(10)->create(); // Vytvoří 10 falešných produktů
    }
}