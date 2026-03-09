<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleAndAbilitySeeder extends Seeder
{
    public function run(): void
    {
        // ===== RUOLI =====
        $roles = [
            [
                'name' => 'Super Admin',
                'slug' => 'super-admin',
                'description' => 'Amministratore con tutti i permessi',
                'is_system' => true
            ],
            [
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'Amministratore con permessi di gestione',
                'is_system' => true
            ],
            [
                'name' => 'Gestore contenuti',
                'slug' => 'content-manager',
                'description' => 'Gestisce film, serie ed episodi',
                'is_system' => true
            ],
            [
                'name' => 'Moderatore',
                'slug' => 'moderator',
                'description' => 'Modera commenti e recensioni',
                'is_system' => true
            ],
            [
                'name' => 'Utente Premium',
                'slug' => 'premium',
                'description' => 'Utente con abbonamento premium',
                'is_system' => true
            ],
            [
                'name' => 'Utente Base',
                'slug' => 'user',
                'description' => 'Utente registrato standard',
                'is_system' => true
            ],
            [
                'name' => 'Ospite',
                'slug' => 'guest',
                'description' => 'Utente non registrato',
                'is_system' => true
            ]
        ];

        foreach ($roles as $role) {
            $role['created_at'] = now();
            $role['updated_at'] = now();
            DB::table('roles')->insert($role);
        }

        // ===== ABILITÀ =====
        $abilities = [
            // Gestione utenti
            ['name' => 'Visualizzare utenti', 'slug' => 'users.view', 'group' => 'users'],
            ['name' => 'Creare utenti', 'slug' => 'users.create', 'group' => 'users'],
            ['name' => 'Modificare utenti', 'slug' => 'users.edit', 'group' => 'users'],
            ['name' => 'Eliminare utenti', 'slug' => 'users.delete', 'group' => 'users'],
            ['name' => 'Gestire ruoli utenti', 'slug' => 'users.manage-roles', 'group' => 'users'],
            
            // Gestione contenuti
            ['name' => 'Visualizzare film', 'slug' => 'movies.view', 'group' => 'movies'],
            ['name' => 'Creare film', 'slug' => 'movies.create', 'group' => 'movies'],
            ['name' => 'Modificare film', 'slug' => 'movies.edit', 'group' => 'movies'],
            ['name' => 'Eliminare film', 'slug' => 'movies.delete', 'group' => 'movies'],
            
            ['name' => 'Visualizzare serie', 'slug' => 'series.view', 'group' => 'series'],
            ['name' => 'Creare serie', 'slug' => 'series.create', 'group' => 'series'],
            ['name' => 'Modificare serie', 'slug' => 'series.edit', 'group' => 'series'],
            ['name' => 'Eliminare serie', 'slug' => 'series.delete', 'group' => 'series'],
            
            ['name' => 'Visualizzare episodi', 'slug' => 'episodes.view', 'group' => 'episodes'],
            ['name' => 'Creare episodi', 'slug' => 'episodes.create', 'group' => 'episodes'],
            ['name' => 'Modificare episodi', 'slug' => 'episodes.edit', 'group' => 'episodes'],
            ['name' => 'Eliminare episodi', 'slug' => 'episodes.delete', 'group' => 'episodes'],
            
            ['name' => 'Gestire categorie', 'slug' => 'categories.manage', 'group' => 'categories'],
            
            // Gestione pagamenti
            ['name' => 'Visualizzare pagamenti', 'slug' => 'payments.view', 'group' => 'payments'],
            ['name' => 'Gestire crediti', 'slug' => 'credits.manage', 'group' => 'payments'],
            
            // Gestione sistema
            ['name' => 'Accedere al pannello admin', 'slug' => 'admin.access', 'group' => 'system'],
            ['name' => 'Visualizzare statistiche', 'slug' => 'stats.view', 'group' => 'system'],
            ['name' => 'Gestire configurazioni', 'slug' => 'config.manage', 'group' => 'system'],
            ['name' => 'Gestire traduzioni', 'slug' => 'translations.manage', 'group' => 'system'],
            
            // Permessi utente base
            ['name' => 'Aggiungere alla watchlist', 'slug' => 'watchlist.add', 'group' => 'user'],
            ['name' => 'Rimuovere dalla watchlist', 'slug' => 'watchlist.remove', 'group' => 'user'],
            ['name' => 'Lasciare recensioni', 'slug' => 'reviews.create', 'group' => 'user'],
        ];

        foreach ($abilities as $ability) {
            $ability['is_system'] = true;
            $ability['created_at'] = now();
            $ability['updated_at'] = now();
            DB::table('abilities')->insert($ability);
        }

        // ===== ASSEGNAZIONE ABILITÀ AI RUOLI =====
        // Super Admin (tutti i permessi)
        $superAdminId = DB::table('roles')->where('slug', 'super-admin')->first()->id;
        $allAbilityIds = DB::table('abilities')->pluck('id');
        foreach ($allAbilityIds as $abilityId) {
            DB::table('role_ability')->insert([
                'role_id' => $superAdminId,
                'ability_id' => $abilityId,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // Admin (permessi di admin senza super)
        $adminId = DB::table('roles')->where('slug', 'admin')->first()->id;
        $adminAbilities = DB::table('abilities')
            ->whereIn('slug', [
                'users.view', 'users.create', 'users.edit', 'users.delete',
                'movies.view', 'movies.create', 'movies.edit', 'movies.delete',
                'series.view', 'series.create', 'series.edit', 'series.delete',
                'episodes.view', 'episodes.create', 'episodes.edit', 'episodes.delete',
                'categories.manage', 'payments.view', 'credits.manage',
                'admin.access', 'stats.view', 'config.manage', 'translations.manage'
            ])->pluck('id');
        foreach ($adminAbilities as $abilityId) {
            DB::table('role_ability')->insert([
                'role_id' => $adminId,
                'ability_id' => $abilityId,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // Gestore contenuti
        $contentManagerId = DB::table('roles')->where('slug', 'content-manager')->first()->id;
        $contentAbilities = DB::table('abilities')
            ->whereIn('group', ['movies', 'series', 'episodes', 'categories'])
            ->orWhere('slug', 'admin.access')
            ->pluck('id');
        foreach ($contentAbilities as $abilityId) {
            DB::table('role_ability')->insert([
                'role_id' => $contentManagerId,
                'ability_id' => $abilityId,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // Utente Premium (watchlist, recensioni)
        $premiumId = DB::table('roles')->where('slug', 'premium')->first()->id;
        $userAbilities = DB::table('abilities')
            ->whereIn('slug', ['watchlist.add', 'watchlist.remove', 'reviews.create'])
            ->pluck('id');
        foreach ($userAbilities as $abilityId) {
            DB::table('role_ability')->insert([
                'role_id' => $premiumId,
                'ability_id' => $abilityId,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // Utente Base (stessi permessi di premium)
        $userId = DB::table('roles')->where('slug', 'user')->first()->id;
        foreach ($userAbilities as $abilityId) {
            DB::table('role_ability')->insert([
                'role_id' => $userId,
                'ability_id' => $abilityId,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // Ospite (nessun permesso speciale)
    }
}