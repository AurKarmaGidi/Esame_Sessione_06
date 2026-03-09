<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('episodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('series_id')->constrained('series')->onDelete('cascade'); // CAMBIATO: 'series' invece di 'series', 'idSeries'
            $table->integer('season_number');
            $table->integer('episode_number');
            $table->string('title');
            $table->text('description');
            $table->integer('duration');
            $table->string('streaming_url');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('episodes');
    }
};