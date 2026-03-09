<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Email, Telefono, Cellulare, Fax, WhatsApp, etc.
            $table->string('code')->unique(); // email, phone, mobile, fax, whatsapp
            $table->string('icon')->nullable(); // per UI
            $table->string('validation_regex')->nullable(); // regex per validazione
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_types');
    }
};