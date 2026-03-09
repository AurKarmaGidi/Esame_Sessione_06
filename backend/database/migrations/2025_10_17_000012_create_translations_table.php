<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('language_id')->constrained('languages')->onDelete('cascade');
            $table->string('group')->default('*'); // * per globale, altrimenti movies, users, etc.
            $table->string('key'); // welcome.message, button.save
            $table->text('value'); // il testo tradotto
            $table->boolean('is_approved')->default(true);
            $table->timestamps();
            
            $table->unique(['language_id', 'group', 'key']);
            $table->index(['group', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('translations');
    }
};