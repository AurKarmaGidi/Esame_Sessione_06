<?php
// backend/app/Models/User.php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory;

    protected $fillable = [
        'name', 'surname', 'email', 'password', 'birth_date',
        'country_code', 'region', 'city', 'address', 'zip_code',
        'subscription_plan', 'subscription_end_date', 'role', 'credits',
        'stripe_customer_id'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'subscription_end_date' => 'date',
        'credits' => 'decimal:2'
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    // Relazioni esistenti...
    public function userAuth()
    {
        return $this->hasOne(UserAuth::class);
    }

    public function userAccesses()
    {
        return $this->hasMany(UserAccess::class);
    }

    public function userPasswords()
    {
        return $this->hasMany(UserPassword::class);
    }

    public function paymentMethods()
    {
        return $this->hasMany(PaymentMethod::class);
    }

    public function watchlistItems()
    {
        return $this->hasMany(Watchlist::class);
    }

    public function watchHistory()
    {
        return $this->hasMany(WatchHistory::class);
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function addCredits($amount)
    {
        $this->credits += $amount;
        $this->save();
        return $this;
    }
}