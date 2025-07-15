<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Spustí migrace.
     */
    public function up(): void
    {
        // ZMĚNA ZDE: Název tabulky je nyní 'raw_request_commissions' (plurál)
        Schema::create('raw_request_commissions', function (Blueprint $table) {
            $table->id(); // ID (Primary Key, Auto-increment)

            $table->string('thema'); // Téma požadavku

            $table->string('contact_email'); // Kontaktní e-mail
            $table->string('contact_phone')->nullable(); // Kontaktní telefon (volitelný)

            $table->text('order_description'); // Popis objednávky (delší text)

            $table->string('status')->default('Nově zadané'); // Stav požadavku
            $table->string('priority')->default('Neutrální'); // Priorita požadavku

            $table->timestamps(); // created_at a updated_at (Laravel automaticky spravuje)

            $table->softDeletes(); // deleted_at (pro soft delete, Laravel automaticky spravuje)
        });
    }

    /**
     * Vrátí migrace zpět.
     */
    public function down(): void
    {
        // ZMĚNA ZDE: Název tabulky je nyní 'raw_request_commissions' (plurál)
        Schema::dropIfExists('raw_request_commissions');
    }
};
