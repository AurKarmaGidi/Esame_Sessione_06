<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContactTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'name' => 'Email',
                'code' => 'email',
                'icon' => '📧',
                'validation_regex' => '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
                'sort_order' => 10
            ],
            [
                'name' => 'Email secondaria',
                'code' => 'email_secondary',
                'icon' => '📨',
                'validation_regex' => '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
                'sort_order' => 20
            ],
            [
                'name' => 'Cellulare',
                'code' => 'mobile',
                'icon' => '📱',
                'validation_regex' => '/^[0-9]{10,15}$/',
                'sort_order' => 30
            ],
            [
                'name' => 'Telefono fisso',
                'code' => 'phone',
                'icon' => '☎️',
                'validation_regex' => '/^[0-9]{7,15}$/',
                'sort_order' => 40
            ],
            [
                'name' => 'WhatsApp',
                'code' => 'whatsapp',
                'icon' => '💬',
                'validation_regex' => '/^[0-9]{10,15}$/',
                'sort_order' => 50
            ],
            [
                'name' => 'Telegram',
                'code' => 'telegram',
                'icon' => '✈️',
                'sort_order' => 60
            ],
            [
                'name' => 'Fax',
                'code' => 'fax',
                'icon' => '📠',
                'validation_regex' => '/^[0-9]{7,15}$/',
                'sort_order' => 70
            ],
            [
                'name' => 'Skype',
                'code' => 'skype',
                'icon' => '💻',
                'sort_order' => 80
            ],
            [
                'name' => 'LinkedIn',
                'code' => 'linkedin',
                'icon' => '🔗',
                'sort_order' => 90
            ]
        ];

        foreach ($types as $type) {
            DB::table('contact_types')->insert(array_merge($type, [
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]));
        }
    }
}