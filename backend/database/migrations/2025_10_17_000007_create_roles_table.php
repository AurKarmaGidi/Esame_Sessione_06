<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Amministratore, Utente Premium, Utente Base, etc.
            $table->string('slug')->unique(); // admin, premium, user, guest
            $table->text('description')->nullable();
            $table->boolean('is_system')->default(false); // ruoli di sistema non eliminabili
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};