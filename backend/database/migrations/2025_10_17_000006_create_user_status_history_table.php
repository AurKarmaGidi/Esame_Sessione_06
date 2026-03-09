<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_status_id')->constrained('user_statuses');
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('reason')->nullable(); // motivo del cambio stato
            $table->timestamp('changed_at');
            $table->timestamp('expires_at')->nullable(); // se lo stato è temporaneo
            $table->timestamps();
            
            $table->index(['user_id', 'changed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_status_history');
    }
};