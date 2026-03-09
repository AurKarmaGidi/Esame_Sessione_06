<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('countries', function (Blueprint $table) {
            $table->id('idCountry');
            $table->string('name');
            $table->string('continent');
            $table->string('iso_code', 2);
            $table->string('iso3_code', 3);
            $table->string('phone_code');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('countries');
    }
}; 