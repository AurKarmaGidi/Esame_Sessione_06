<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Country;
use Illuminate\Support\Facades\DB;

class CountriesSeeder extends Seeder
{
    public function run(): void
    {
        $csv = storage_path("app/csv_db/nazioni.csv");
        $file = fopen($csv, "r");
        while (($data = fgetcsv($file, 200, ",")) !== false) {
            Country::create(
                [
                    'idCountry' => $data[0],
                    'name' => $data[1],
                    'continent' => $data[2],
                    'iso_code' => $data[3],
                    'iso3_code' => $data[4],
                    'phone_code' => $data[5],
                ]
            );
        }
    }
} 