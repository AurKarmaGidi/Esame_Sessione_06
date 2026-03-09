<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Episode extends Model
{
    use HasFactory;

    protected $fillable = [
        'series_id', 'season_number', 'episode_number',
        'title', 'description', 'duration', 'streaming_url'
    ];

    public function series()
    {
        return $this->belongsTo(Series::class, 'series_id');
    }
}