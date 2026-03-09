<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Movie extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = "movies";
    protected $primaryKey = "id";

    protected $fillable = [
        'title', 'movie_genre', 'description', 'director', 
        'release_year', 'duration', 'poster', 'youtube_link'
    ];
}