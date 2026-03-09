<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Attivo, Sospeso, Bannato, Inattivo, In attesa di verifica, etc.
            $table->string('code')->unique(); // active, suspended, banned, inactive, pending
            $table->string('color')->nullable(); // per UI (es. #00ff00)
            $table->text('description')->nullable();
            $table->boolean('can_login')->default(true); // se può accedere al sistema
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_statuses');
    }
};