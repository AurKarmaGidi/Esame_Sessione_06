<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users_auth', function (Blueprint $table) {
            $table->id('idUserAuth');
            $table->unsignedBigInteger('user_id');
            $table->string('user')->unique();
            $table->string('sfida')->nullable();
            $table->string('secretJWT')->nullable();
            $table->integer('inizioSfida')->nullable();
            $table->boolean('obbligoCambio')->default(false);
            $table->timestamps();
        });

        Schema::create('users_access', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->boolean('autenticato')->default(false);
            $table->string('ip', 45);
            $table->timestamps();
        });

        Schema::create('users_password', function (Blueprint $table) {
            $table->id('idUserPassword');
            $table->unsignedBigInteger('user_id');
            $table->string('psw');
            $table->string('sale');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users_password');
        Schema::dropIfExists('users_access');
        Schema::dropIfExists('users_auth');
    }
};