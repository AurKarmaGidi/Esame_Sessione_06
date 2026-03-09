<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserStatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            [
                'name' => 'Attivo',
                'code' => 'active',
                'color' => '#10b981', // verde
                'description' => 'Utente attivo e in regola',
                'can_login' => true
            ],
            [
                'name' => 'In attesa di verifica',
                'code' => 'pending',
                'color' => '#f59e0b', // arancione
                'description' => 'Utente registrato ma non ancora verificato',
                'can_login' => false
            ],
            [
                'name' => 'Sospeso',
                'code' => 'suspended',
                'color' => '#ef4444', // rosso
                'description' => 'Utente sospeso temporaneamente',
                'can_login' => false
            ],
            [
                'name' => 'Bannato',
                'code' => 'banned',
                'color' => '#dc2626', // rosso scuro
                'description' => 'Utente bannato permanentemente',
                'can_login' => false
            ],
            [
                'name' => 'Inattivo',
                'code' => 'inactive',
                'color' => '#6b7280', // grigio
                'description' => 'Utente che non ha mai effettuato l\'accesso o inattivo da lungo tempo',
                'can_login' => true
            ],
            [
                'name' => 'Password scaduta',
                'code' => 'password_expired',
                'color' => '#f97316', // arancione scuro
                'description' => 'Utente con password scaduta, deve cambiarla',
                'can_login' => true
            ],
            [
                'name' => 'In cancellazione',
                'code' => 'deleting',
                'color' => '#6b7280', // grigio
                'description' => 'Account in fase di cancellazione',
                'can_login' => false
            ]
        ];

        foreach ($statuses as $status) {
            DB::table('user_statuses')->insert(array_merge($status, [
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]));
        }
    }
}