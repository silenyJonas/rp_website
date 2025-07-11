<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User; // Importuj tvůj model User, který odkazuje na user_login

class UserLoginSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Vytvoří testovacího administrátorského uživatele
        User::create([
            'user_email' => 'admin@example.com', // E-mail pro přihlášení
            'user_password_hash' => Hash::make('password123'), // Heslo bude 'password123' (hashované Bcryptem)
            'user_password_salt' => '', // Bcrypt nepotřebuje externí salt, takže může být prázdný
            'last_login_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
            'deleted_at' => null,
            'is_deleted' => false,
        ]);

        $this->command->info('Uživatel admin@example.com vytvořen s heslem "password123" v tabulce user_login.');
    }
}