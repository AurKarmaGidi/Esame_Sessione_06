<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('movies', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->string('movie_genre', 45);
            $table->text('description')->nullable();
            $table->string('director',45);
            $table->integer('release_year');
            $table->integer('duration');
            $table->string('poster');
            $table->string('youtube_link');
            $table->softDeletes();
            $table->timestamps();
        });
    }  

    public function down()
    {
        Schema::dropIfExists('movies');
    }
};