<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\City;
use Illuminate\Support\Facades\DB;

class CitiesSeeder extends Seeder
{
    public function run(): void
    {
        $csv = storage_path("app/csv_db/comuniItaliani.csv");
        $file = fopen($csv, "r");
        while (($data = fgetcsv($file, 200, ",")) !== false) {
            City::create(
                [
                    'idCity' => $data[0],
                    'name' => $data[1],
                    'region' => $data[2],
                    'province' => $data[3],
                    'iso_code' => $data[4],
                    'cadastal_code' => $data[5],
                    'zip_code' => $data[6],
                ]
            );
        }
    }
} 