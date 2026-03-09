<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Series extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = "series";
    protected $primaryKey = "id";

    protected $fillable = [
        'title', 'series_genre', 'description', 'director', 
        'release_year', 'duration', 'poster', 'youtube_link',
        'seasons', 'episodes'
    ];

    public function episodes()
    {
        return $this->hasMany(Episode::class, 'series_id'); 
    }
}