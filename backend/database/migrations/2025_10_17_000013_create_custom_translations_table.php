<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('custom_translations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('language_id');
            $table->string('translatable_type');
            $table->unsignedBigInteger('translatable_id');
            $table->string('group')->default('*');
            $table->string('key');
            $table->text('value');
            $table->timestamps();

            // Indici separati invece di un unico indice complesso
            $table->index('language_id');
            $table->index(['translatable_type', 'translatable_id']);
            $table->index(['group', 'key']);

            // Foreign key separata
            $table->foreign('language_id')
                ->references('id')
                ->on('languages')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_translations');
    }
};