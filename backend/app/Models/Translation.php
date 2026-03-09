<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Translation extends Model
{
    use HasFactory;

    protected $table = 'translations';

    protected $fillable = [
        'language_id', 'group', 'key', 'value', 'is_approved'
    ];

    protected $casts = [
        'is_approved' => 'boolean'
    ];

    public function language()
    {
        return $this->belongsTo(Language::class);
    }
}