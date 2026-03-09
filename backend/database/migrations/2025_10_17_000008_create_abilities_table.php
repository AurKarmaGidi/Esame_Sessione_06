<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('abilities', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Creare utenti, Modificare film, etc.
            $table->string('slug')->unique(); // users.create, movies.edit
            $table->string('group')->nullable(); // users, movies, series, payments
            $table->text('description')->nullable();
            $table->boolean('is_system')->default(false);
            $table->timestamps();
            
            $table->index('group');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('abilities');
    }
};