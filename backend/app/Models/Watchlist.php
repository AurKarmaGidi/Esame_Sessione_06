<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Watchlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'content_id', 'content_type'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function movie()
    {
        return $this->belongsTo(Movie::class, 'content_id')->where('content_type', 'movie');
    }

    public function series()
    {
        return $this->belongsTo(Series::class, 'content_id')->where('content_type', 'series');
    }
}