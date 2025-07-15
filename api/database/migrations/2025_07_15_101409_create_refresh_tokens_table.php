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
        Schema::create('refresh_tokens', function (Blueprint $table) {
            $table->id();
            // ZMĚNA ZDE: Používáme unsignedInteger pro PŘESNOU shodu s INT(10) UNSIGNED v user_login
            $table->unsignedInteger('user_login_id'); 
            $table->foreign('user_login_id')->references('user_login_id')->on('user_login')->onDelete('cascade');
            
            $table->string('token', 64)->unique(); // Samotný obnovovací token (hashovaný)
            $table->timestamp('expires_at')->nullable(); // Datum vypršení platnosti obnovovacího tokenu
            $table->timestamps(); // created_at a updated_at
        });
    }

    /**
     * Vrátí migrace zpět.
     */
    public function down(): void
    {
        Schema::dropIfExists('refresh_tokens');
    }
};
