<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('contact_type_id')->constrained('contact_types');
            $table->string('value'); // l'email, il numero di telefono, etc.
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->boolean('is_primary')->default(false); // contatto principale per quel tipo
            $table->boolean('is_public')->default(false); // visibile pubblicamente
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Un utente non può avere due contatti dello stesso tipo con lo stesso valore
            $table->unique(['user_id', 'contact_type_id', 'value']);
            
            // Indici per ricerca
            $table->index('value');
            $table->index(['user_id', 'is_primary']);
            $table->index(['user_id', 'is_verified']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_contacts');
    }
};