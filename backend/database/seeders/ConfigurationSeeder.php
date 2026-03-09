<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ConfigurationSeeder extends Seeder
{
    public function run(): void
    {
        $configs = [
            // Generali
            [
                'key' => 'app.name',
                'value' => 'Codex Streaming',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Nome dell\'applicazione',
                'is_public' => true
            ],
            [
                'key' => 'app.support_email',
                'value' => 'support@codexstreaming.com',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Email di supporto',
                'is_public' => true
            ],
            
            // Pagamenti
            [
                'key' => 'payment.currency',
                'value' => 'EUR',
                'type' => 'string',
                'group' => 'payment',
                'description' => 'Valuta predefinita per i pagamenti',
                'is_public' => true
            ],
            [
                'key' => 'payment.min_credits',
                'value' => '1',
                'type' => 'integer',
                'group' => 'payment',
                'description' => 'Minimo di crediti acquistabili',
                'is_public' => true
            ],
            [
                'key' => 'payment.max_credits',
                'value' => '1000',
                'type' => 'integer',
                'group' => 'payment',
                'description' => 'Massimo di crediti acquistabili',
                'is_public' => true
            ],
            [
                'key' => 'payment.stripe_enabled',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'payment',
                'description' => 'Abilita pagamenti con Stripe',
                'is_public' => false
            ],
            
            // Contenuti
            [
                'key' => 'content.movies_per_page',
                'value' => '12',
                'type' => 'integer',
                'group' => 'content',
                'description' => 'Numero di film per pagina',
                'is_public' => true
            ],
            [
                'key' => 'content.series_per_page',
                'value' => '12',
                'type' => 'integer',
                'group' => 'content',
                'description' => 'Numero di serie per pagina',
                'is_public' => true
            ],
            [
                'key' => 'content.featured_count',
                'value' => '5',
                'type' => 'integer',
                'group' => 'content',
                'description' => 'Numero di contenuti in evidenza',
                'is_public' => true
            ],
            
            // Sottoscrizioni
            [
                'key' => 'subscription.free.credits',
                'value' => '0',
                'type' => 'integer',
                'group' => 'subscription',
                'description' => 'Crediti mensili per piano free',
                'is_public' => true
            ],
            [
                'key' => 'subscription.premium.credits',
                'value' => '20',
                'type' => 'integer',
                'group' => 'subscription',
                'description' => 'Crediti mensili per piano premium',
                'is_public' => true
            ],
            [
                'key' => 'subscription.premium.price',
                'value' => '9.99',
                'type' => 'string',
                'group' => 'subscription',
                'description' => 'Prezzo mensile piano premium',
                'is_public' => true
            ],
            [
                'key' => 'subscription.vip.credits',
                'value' => '50',
                'type' => 'integer',
                'group' => 'subscription',
                'description' => 'Crediti mensili per piano vip',
                'is_public' => true
            ],
            [
                'key' => 'subscription.vip.price',
                'value' => '19.99',
                'type' => 'string',
                'group' => 'subscription',
                'description' => 'Prezzo mensile piano vip',
                'is_public' => true
            ],
            
            // Manutenzione
            [
                'key' => 'maintenance.mode',
                'value' => 'false',
                'type' => 'boolean',
                'group' => 'system',
                'description' => 'Modalità manutenzione',
                'is_public' => true
            ],
            [
                'key' => 'maintenance.message',
                'value' => 'Siamo in manutenzione, torneremo presto!',
                'type' => 'string',
                'group' => 'system',
                'description' => 'Messaggio di manutenzione',
                'is_public' => true
            ]
        ];

        foreach ($configs as $config) {
            $config['is_system'] = true;
            $config['created_at'] = now();
            $config['updated_at'] = now();
            DB::table('configurations')->insert($config);
        }
    }
}