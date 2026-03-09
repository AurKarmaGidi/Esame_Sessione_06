<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    use HasFactory;

    protected $fillable = [
        'idCountry', 'name', 'continent', 'iso_code', 'iso3_code', 'phone_code'
    ];
}  