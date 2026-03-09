<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AddressTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'name' => 'Residenza',
                'code' => 'residence',
                'description' => 'Indirizzo di residenza principale',
                'sort_order' => 10
            ],
            [
                'name' => 'Domicilio',
                'code' => 'domicile',
                'description' => 'Indirizzo di domicilio (diverso dalla residenza)',
                'sort_order' => 20
            ],
            [
                'name' => 'Fatturazione',
                'code' => 'billing',
                'description' => 'Indirizzo per fatturazione',
                'sort_order' => 30
            ],
            [
                'name' => 'Spedizione',
                'code' => 'shipping',
                'description' => 'Indirizzo per spedizioni',
                'sort_order' => 40
            ],
            [
                'name' => 'Lavoro',
                'code' => 'work',
                'description' => 'Indirizzo dell\'ufficio o luogo di lavoro',
                'sort_order' => 50
            ],
            [
                'name' => 'Seconda casa',
                'code' => 'vacation',
                'description' => 'Indirizzo di una seconda casa o vacanza',
                'sort_order' => 60
            ]
        ];

        foreach ($types as $type) {
            DB::table('address_types')->insert(array_merge($type, [
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]));
        }
    }
}