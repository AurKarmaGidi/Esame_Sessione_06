<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // Seeder esistenti
            AdminUserSeeder::class,
            CountriesSeeder::class,
            CitiesSeeder::class,
            MoviesSeeder::class,
            SeriesSeeder::class,
            
            // Nuovi seeder
            AddressTypeSeeder::class,
            ContactTypeSeeder::class,
            UserStatusSeeder::class,
            RoleAndAbilitySeeder::class,
            LanguageSeeder::class,
            ConfigurationSeeder::class,
        ]);
    }
}