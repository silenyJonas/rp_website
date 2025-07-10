<?php

namespace Database\Seeders;

use App\Models\Raw_request_commission;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
            // Spustí seeder pro produkty
        $this->call(Raw_request_commission::class);

        // Volitelně můžete přidat i další seedery, např. pro uživatele
        // \App\Models\User::factory(10)->create(); // Příklad pro 10 uživatelů
        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
