<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Series;
use Illuminate\Support\Facades\DB;

class SeriesSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('series')->delete();

        $csvFile = fopen(storage_path('app/csv_db/series.csv'), 'r');
        
        $header = fgetcsv($csvFile, 2000, ",");
        
        while (($data = fgetcsv($csvFile, 2000, ",")) !== false) {
            if (count($data) < 11) {
                continue;
            }

            $data = array_map('trim', $data);

            Series::create([
                // RIMOSSO: 'idSeries' => (int)$data[0],
                'title' => $data[1],
                'series_genre' => $data[2],
                'description' => $data[3],
                'director' => $data[4],
                'release_year' => (int)$data[5],
                'duration' => (int)$data[6],
                'poster' => $data[7],
                'youtube_link' => $data[8],
                'seasons' => (int)$data[9],
                'episodes' => (int)$data[10],
            ]);
        }
        
        fclose($csvFile);
    }
}