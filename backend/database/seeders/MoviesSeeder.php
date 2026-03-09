<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Movie;
use Illuminate\Support\Facades\DB;

class MoviesSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('movies')->delete();

        $csvFile = fopen(storage_path('app/csv_db/movies.csv'), 'r');
        
        // Salta l'header
        $header = fgetcsv($csvFile, 2000, ",");
        
        while (($data = fgetcsv($csvFile, 2000, ",")) !== false) {
            if (count($data) < 9) {
                continue;
            }

            $data = array_map('trim', $data);

            Movie::create([
                // RIMOSSO: 'idMovie' => (int)$data[0], 
                'title' => $data[1],
                'movie_genre' => $data[2],
                'description' => $data[3],
                'director' => $data[4],
                'release_year' => (int)$data[5],
                'duration' => (int)$data[6],
                'poster' => $data[7],
                'youtube_link' => $data[8],
            ]);
        }
        
        fclose($csvFile);
    }
}