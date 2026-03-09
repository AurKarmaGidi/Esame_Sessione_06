<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAccess extends Model
{
    use HasFactory;

    protected $table = 'users_access';
    
    protected $fillable = [
        'user_id', 'autenticato', 'ip'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}