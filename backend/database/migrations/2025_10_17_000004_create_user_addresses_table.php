<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('address_type_id')->constrained('address_types');
            $table->boolean('is_default')->default(false);
            
            // Dati indirizzo
            $table->string('street'); // Via/Piazza
            $table->string('street_number')->nullable(); // Numero civico
            $table->string('street_number_extra')->nullable(); // Scala/Interno
            $table->string('city');
            $table->string('province', 2)->nullable(); // Sigla provincia
            $table->string('postal_code', 10);
            $table->string('country_code', 2)->default('IT');
            $table->string('region')->nullable();
            
            // Coordinate (opzionali)
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indici
            $table->index(['user_id', 'is_default']);
            $table->index(['country_code', 'postal_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_addresses');
    }
};