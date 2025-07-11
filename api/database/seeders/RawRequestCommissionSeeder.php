<?php

namespace Database\Seeders; // <<<<<<<<<< DŮLEŽITÉ: Musí být přesně toto

use Illuminate\Database\Seeder;
use App\Models\RawRequestCommission; // <<<<<<<<<< DŮLEŽITÉ: Ujisti se, že model je na správné cestě a název je správný

class RawRequestCommissionSeeder extends Seeder // <<<<<<<<<< DŮLEŽITÉ: Název třídy MUSÍ přesně odpovídat názvu souboru
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Použij Factory k vytvoření 10 falešných záznamů pro RawRequestCommission
        RawRequestCommission::factory()->count(10)->create();

        $this->command->info('Vytvořeno 10 falešných záznamů v tabulce raw_request_commission.');
    }
}