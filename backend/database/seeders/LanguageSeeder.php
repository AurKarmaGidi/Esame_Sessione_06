<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LanguageSeeder extends Seeder
{
    public function run(): void
    {
        $languages = [
            [
                'name' => 'Italiano',
                'code' => 'it',
                'locale' => 'it_IT',
                'flag' => '🇮🇹',
                'is_default' => true,
                'sort_order' => 10
            ],
            [
                'name' => 'English',
                'code' => 'en',
                'locale' => 'en_US',
                'flag' => '🇬🇧',
                'is_default' => false,
                'sort_order' => 20
            ],
            [
                'name' => 'Français',
                'code' => 'fr',
                'locale' => 'fr_FR',
                'flag' => '🇫🇷',
                'is_default' => false,
                'sort_order' => 30
            ],
            [
                'name' => 'Español',
                'code' => 'es',
                'locale' => 'es_ES',
                'flag' => '🇪🇸',
                'is_default' => false,
                'sort_order' => 40
            ],
            [
                'name' => 'Deutsch',
                'code' => 'de',
                'locale' => 'de_DE',
                'flag' => '🇩🇪',
                'is_default' => false,
                'sort_order' => 50
            ]
        ];

        foreach ($languages as $language) {
            DB::table('languages')->updateOrInsert(
                ['code' => $language['code']],
                array_merge($language, [
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now()
                ])
            );
        }

        // Ottieni gli ID delle lingue
        $italianId = DB::table('languages')->where('code', 'it')->first()->id;
        $englishId = DB::table('languages')->where('code', 'en')->first()->id;

        // TUTTE LE TRADUZIONI NECESSARIE
        $translations = [
            // Welcome
            ['group' => '*', 'key' => 'welcome.title', 'it_value' => 'Benvenuto su Codex Streaming', 'en_value' => 'Welcome to Codex Streaming'],
            ['group' => '*', 'key' => 'welcome.subtitle', 'it_value' => 'Il tuo cinema a portata di click', 'en_value' => 'Your cinema at your fingertips'],

            // Navigazione
            ['group' => 'nav', 'key' => 'nav.home', 'it_value' => 'Pagina Iniziale', 'en_value' => 'Home'],
            ['group' => 'nav', 'key' => 'nav.type', 'it_value' => 'Tipologia', 'en_value' => 'Type'],
            ['group' => 'nav', 'key' => 'nav.movies', 'it_value' => 'Film', 'en_value' => 'Movies'],
            ['group' => 'nav', 'key' => 'nav.series', 'it_value' => 'Serie TV', 'en_value' => 'TV Series'],
            ['group' => 'nav', 'key' => 'nav.categories', 'it_value' => 'Categorie', 'en_value' => 'Categories'],
            ['group' => 'nav', 'key' => 'nav.login', 'it_value' => 'Accedi', 'en_value' => 'Login'],
            ['group' => 'nav', 'key' => 'nav.logout', 'it_value' => 'Esci', 'en_value' => 'Logout'],
            ['group' => 'nav', 'key' => 'nav.account', 'it_value' => 'Il mio account', 'en_value' => 'My account'],
            ['group' => 'nav', 'key' => 'nav.admin', 'it_value' => 'Pannello Admin', 'en_value' => 'Admin Panel'],
            ['group' => 'nav', 'key' => 'nav.watchlist', 'it_value' => 'La mia lista', 'en_value' => 'My Watchlist'],
            ['group' => 'nav', 'key' => 'nav.profile', 'it_value' => 'Profilo', 'en_value' => 'Profile'],


            // Bottoni
            ['group' => 'button', 'key' => 'button.login', 'it_value' => 'Accedi', 'en_value' => 'Login'],
            ['group' => 'button', 'key' => 'button.register', 'it_value' => 'Registrati', 'en_value' => 'Register'],
            ['group' => 'button', 'key' => 'button.logout', 'it_value' => 'Esci', 'en_value' => 'Logout'],
            ['group' => 'button', 'key' => 'button.save', 'it_value' => 'Salva', 'en_value' => 'Save'],
            ['group' => 'button', 'key' => 'button.cancel', 'it_value' => 'Annulla', 'en_value' => 'Cancel'],
            ['group' => 'button', 'key' => 'button.delete', 'it_value' => 'Elimina', 'en_value' => 'Delete'],
            ['group' => 'button', 'key' => 'button.edit', 'it_value' => 'Modifica', 'en_value' => 'Edit'],
            ['group' => 'button', 'key' => 'button.add', 'it_value' => 'Aggiungi', 'en_value' => 'Add'],

            // Ricerca
            ['group' => 'search', 'key' => 'search.placeholder', 'it_value' => 'Cerca film o serie...', 'en_value' => 'Search movies or series...'],
            ['group' => 'search', 'key' => 'search.no_results', 'it_value' => 'Nessun risultato trovato per "{{query}}"', 'en_value' => 'No results found for "{{query}}"'],

            // Filtri
            ['group' => 'filter', 'key' => 'filter.genre', 'it_value' => 'Genere', 'en_value' => 'Genre'],
            ['group' => 'filter', 'key' => 'filter.year', 'it_value' => 'Anno', 'en_value' => 'Year'],
            ['group' => 'filter', 'key' => 'filter.apply', 'it_value' => 'Applica filtri', 'en_value' => 'Apply filters'],

            // Contenuti
            ['group' => 'content', 'key' => 'movie.details', 'it_value' => 'Dettagli film', 'en_value' => 'Movie details'],
            ['group' => 'content', 'key' => 'series.details', 'it_value' => 'Dettagli serie', 'en_value' => 'Series details'],
            ['group' => 'content', 'key' => 'episodes', 'it_value' => 'Episodi', 'en_value' => 'Episodes'],
            ['group' => 'content', 'key' => 'season', 'it_value' => 'Stagione', 'en_value' => 'Season'],
            ['group' => 'content', 'key' => 'duration', 'it_value' => 'Durata', 'en_value' => 'Duration'],
            ['group' => 'content', 'key' => 'director', 'it_value' => 'Regista', 'en_value' => 'Director'],
            ['group' => 'content', 'key' => 'release_year', 'it_value' => 'Anno di uscita', 'en_value' => 'Release year'],
            ['group' => 'content', 'key' => 'series.seasons', 'it_value' => 'stagioni', 'en_value' => 'seasons'],

            // Aggiungi queste traduzioni all'array $translations nel LanguageSeeder.php

                // Categorie (generi)
            ['group' => 'categories', 'key' => 'category.Azione', 'it_value' => 'Azione', 'en_value' => 'Action'],
            ['group' => 'categories', 'key' => 'category.Avventura', 'it_value' => 'Avventura', 'en_value' => 'Adventure'],
            ['group' => 'categories', 'key' => 'category.Animazione', 'it_value' => 'Animazione', 'en_value' => 'Animation'],
            ['group' => 'categories', 'key' => 'category.Biografico', 'it_value' => 'Biografico', 'en_value' => 'Biographical'],
            ['group' => 'categories', 'key' => 'category.Commedia', 'it_value' => 'Commedia', 'en_value' => 'Comedy'],
            ['group' => 'categories', 'key' => 'category.Comico', 'it_value' => 'Comico', 'en_value' => 'Comic'],
            ['group' => 'categories', 'key' => 'category.Documentario', 'it_value' => 'Documentario', 'en_value' => 'Documentary'],
            ['group' => 'categories', 'key' => 'category.Drammatico', 'it_value' => 'Drammatico', 'en_value' => 'Dramatic'],
            ['group' => 'categories', 'key' => 'category.Erotico', 'it_value' => 'Erotico', 'en_value' => 'Erotic'],
            ['group' => 'categories', 'key' => 'category.Fantascienza', 'it_value' => 'Fantascienza', 'en_value' => 'Sci-Fi'],
            ['group' => 'categories', 'key' => 'category.Fantasy', 'it_value' => 'Fantasy', 'en_value' => 'Fantasy'],
            ['group' => 'categories', 'key' => 'category.Giallo', 'it_value' => 'Giallo', 'en_value' => 'Mystery'],
            ['group' => 'categories', 'key' => 'category.Guerra', 'it_value' => 'Guerra', 'en_value' => 'War'],
            ['group' => 'categories', 'key' => 'category.Horror', 'it_value' => 'Horror', 'en_value' => 'Horror'],
            ['group' => 'categories', 'key' => 'category.Mitologico', 'it_value' => 'Mitologico', 'en_value' => 'Mythological'],
            ['group' => 'categories', 'key' => 'category.Musicale', 'it_value' => 'Musicale', 'en_value' => 'Musical'],
            ['group' => 'categories', 'key' => 'category.Noir', 'it_value' => 'Noir', 'en_value' => 'Noir'],
            ['group' => 'categories', 'key' => 'category.Politico', 'it_value' => 'Politico', 'en_value' => 'Political'],
            ['group' => 'categories', 'key' => 'category.Poliziesco', 'it_value' => 'Poliziesco', 'en_value' => 'Crime'],
            ['group' => 'categories', 'key' => 'category.Religioso', 'it_value' => 'Religioso', 'en_value' => 'Religious'],
            ['group' => 'categories', 'key' => 'category.Sentimentale', 'it_value' => 'Sentimentale', 'en_value' => 'Romance'],
            ['group' => 'categories', 'key' => 'category.Spionaggio', 'it_value' => 'Spionaggio', 'en_value' => 'Spy'],
            ['group' => 'categories', 'key' => 'category.Sportivo', 'it_value' => 'Sportivo', 'en_value' => 'Sports'],
            ['group' => 'categories', 'key' => 'category.Storico', 'it_value' => 'Storico', 'en_value' => 'Historical'],
            ['group' => 'categories', 'key' => 'category.Thriller', 'it_value' => 'Thriller', 'en_value' => 'Thriller'],
            ['group' => 'categories', 'key' => 'category.Western', 'it_value' => 'Western', 'en_value' => 'Western'],

            // Home
            ['group' => 'home', 'key' => 'home.title', 'it_value' => 'Un mondo di intrattenimento con un semplice click', 'en_value' => 'A world of entertainment with one click'],
            ['group' => 'home', 'key' => 'home.subtitle', 'it_value' => 'Inserisci qui la tua e-mail ed iscriviti a', 'en_value' => 'Enter your email and subscribe to'],
            ['group' => 'home', 'key' => 'home.email_placeholder', 'it_value' => 'Indirizzo email', 'en_value' => 'Email address'],

            // Utente
            ['group' => 'user', 'key' => 'user.email', 'it_value' => 'Email', 'en_value' => 'Email'],
            ['group' => 'user', 'key' => 'user.password', 'it_value' => 'Password', 'en_value' => 'Password'],
            ['group' => 'user', 'key' => 'user.email_placeholder', 'it_value' => 'Inserisci la tua email', 'en_value' => 'Enter your email'],
            ['group' => 'user', 'key' => 'user.password_placeholder', 'it_value' => 'Inserisci la tua password', 'en_value' => 'Enter your password'],
            ['group' => 'user', 'key' => 'user.forgot_password', 'it_value' => 'Password dimenticata?', 'en_value' => 'Forgot password?'],

            // Validazione
            ['group' => 'validation', 'key' => 'validation.email_required', 'it_value' => 'Inserisci un indirizzo email', 'en_value' => 'Email is required'],
            ['group' => 'validation', 'key' => 'validation.email_invalid', 'it_value' => 'Inserisci un indirizzo email valido', 'en_value' => 'Enter a valid email'],
            ['group' => 'validation', 'key' => 'validation.password_required', 'it_value' => 'Inserisci la password', 'en_value' => 'Password is required'],

            // Comuni
            ['group' => 'common', 'key' => 'common.or', 'it_value' => 'oppure', 'en_value' => 'or'],

            // Login
            ['group' => 'login', 'key' => 'login.test_users', 'it_value' => 'Utenti di test: user@codex.com / admin@codex.com', 'en_value' => 'Test users: user@codex.com / admin@codex.com'],
        ];

        foreach ($translations as $trans) {
            // Inserisci traduzioni italiane
            DB::table('translations')->updateOrInsert(
                ['language_id' => $italianId, 'key' => $trans['key']],
                [
                    'group' => $trans['group'],
                    'value' => $trans['it_value'],
                    'is_approved' => true,
                    'updated_at' => now(),
                    'created_at' => now()
                ]
            );

            // Inserisci traduzioni inglesi
            DB::table('translations')->updateOrInsert(
                ['language_id' => $englishId, 'key' => $trans['key']],
                [
                    'group' => $trans['group'],
                    'value' => $trans['en_value'],
                    'is_approved' => true,
                    'updated_at' => now(),
                    'created_at' => now()
                ]
            );
        }
    }
}