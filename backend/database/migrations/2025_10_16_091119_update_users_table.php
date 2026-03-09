<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('surname')->after('name');
            $table->date('birth_date')->after('surname');
            $table->string('country_code', 3)->after('birth_date');
            $table->string('region')->after('country_code');
            $table->string('city')->after('region');
            $table->string('address')->after('city');
            $table->string('zip_code')->after('address');
            $table->string('subscription_plan')->default('free')->after('zip_code');
            $table->date('subscription_end_date')->nullable()->after('subscription_plan');
            $table->enum('role', ['guest', 'user', 'admin'])->default('guest')->after('subscription_end_date');
            $table->decimal('credits', 8, 2)->default(0.00)->after('role');
            $table->string('stripe_customer_id')->nullable()->after('credits');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'surname',
                'birth_date',
                'country_code',
                'region',
                'city',
                'address',
                'zip_code',
                'subscription_plan',
                'subscription_end_date',
                'role',
                'credits',
                'stripe_customer_id'
            ]);
        });
    }
};