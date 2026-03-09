<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Vista per unire traduzioni standard e personalizzate
        DB::statement("
            CREATE VIEW translation_view AS
            SELECT 
                t.language_id,
                NULL as translatable_type,
                NULL as translatable_id,
                t.group,
                t.key,
                t.value,
                t.is_approved,
                t.created_at,
                t.updated_at
            FROM translations t
            
            UNION ALL
            
            SELECT 
                ct.language_id,
                ct.translatable_type,
                ct.translatable_id,
                ct.group,
                ct.key,
                ct.value,
                1 as is_approved,
                ct.created_at,
                ct.updated_at
            FROM custom_translations ct
        ");
    }

    public function down(): void
    {
        DB::statement("DROP VIEW IF EXISTS translation_view");
    }
};