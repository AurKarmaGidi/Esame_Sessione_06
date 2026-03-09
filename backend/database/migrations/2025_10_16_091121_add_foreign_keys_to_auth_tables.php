<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('users_auth', function (Blueprint $table) {
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });

        Schema::table('users_access', function (Blueprint $table) {
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });

        Schema::table('users_password', function (Blueprint $table) {
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('users_password', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('users_access', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('users_auth', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
    }
};