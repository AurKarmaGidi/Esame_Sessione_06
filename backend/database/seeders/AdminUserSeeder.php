<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserAuth;
use App\Models\UserPassword;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // === UTENTE ADMIN ===
        $passwordRealeAdmin = 'password123';
        $saleAdmin = hash("sha512", trim(Str::random(200)));
        $passwordHashAdmin = hash("sha512", $passwordRealeAdmin . $saleAdmin);

        // Creo utente admin - ORA password VERRÀ SALVATA grazie al fillable aggiornato
        $adminUser = User::create([
            'name' => 'Admin',
            'surname' => 'User',
            'email' => 'admin@codex.com',
            'password' => Hash::make($passwordRealeAdmin),  // <- Questa riga ora funzionerà!
            'birth_date' => '1990-01-01',
            'country_code' => 'IT',
            'region' => 'Lazio',
            'city' => 'Roma',
            'address' => 'Via Admin 1',
            'zip_code' => '00100',
            'role' => 'admin',
            'subscription_plan' => 'premium',
            'credits' => 100.00 
        ]);

        // Crea record auth per admin
        UserAuth::create([
            'user_id' => $adminUser->id,
            'user' => 'admin@codex.com',
            'obbligoCambio' => false
        ]);

        // Crea password per il sistema sicuro
        UserPassword::create([
            'user_id' => $adminUser->id,
            'psw' => $passwordHashAdmin,
            'sale' => $saleAdmin
        ]);

        // === UTENTE NORMALE ===
        $passwordRealeUser = 'password123';
        $saleUser = hash("sha512", trim(Str::random(200)));
        $passwordHashUser = hash("sha512", $passwordRealeUser . $saleUser);

        // Creo utente normale per test
        $normalUser = User::create([
            'name' => 'Mario',
            'surname' => 'Rossi',
            'email' => 'user@codex.com',
            'password' => Hash::make($passwordRealeUser),
            'birth_date' => '1990-01-01',
            'country_code' => 'IT',
            'region' => 'Lombardia',
            'city' => 'Milano',
            'address' => 'Via Roma 1',
            'zip_code' => '20100',
            'role' => 'user',
            'subscription_plan' => 'free',
            'credits' => 1.00 
        ]);

        // Crea record auth per utente normale
        UserAuth::create([
            'user_id' => $normalUser->id,
            'user' => 'user@codex.com',
            'obbligoCambio' => false
        ]);

        // Crea password per il sistema sicuro
        UserPassword::create([
            'user_id' => $normalUser->id,
            'psw' => $passwordHashUser,
            'sale' => $saleUser
        ]);
    }
}