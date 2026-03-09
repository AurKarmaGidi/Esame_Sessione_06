<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('watch_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('content_id');
            $table->enum('content_type', ['movie', 'series', 'episode']);
            $table->timestamp('watched_at');
            $table->integer('progress')->default(0); // Percentuale o minuti visti
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('watch_histories');
    }
};