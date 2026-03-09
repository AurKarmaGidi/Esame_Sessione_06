<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('watchlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('content_id'); // ID del film o della serie
            $table->enum('content_type', ['movie', 'series']);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('watchlists');
    }
};