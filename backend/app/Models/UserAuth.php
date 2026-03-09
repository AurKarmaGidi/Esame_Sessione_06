<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAuth extends Model
{
    use HasFactory;

    protected $table = 'users_auth';
    protected $primaryKey = 'idUserAuth';

    protected $fillable = [
        'user_id', 'user', 'sfida', 'secretJWT', 'inizioSfida', 'obbligoCambio'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function passwords()
    {
        return $this->hasMany(UserPassword::class, 'user_id', 'user_id');
    }
}