<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Language extends Model
{
  use HasFactory;

  protected $fillable = [
    'name',
    'code',
    'locale',
    'flag',
    'is_active',
    'is_default',
    'sort_order'
  ];

  protected $casts = [
    'is_active' => 'boolean',
    'is_default' => 'boolean'
  ];

  public function translations()
  {
    return $this->hasMany(Translation::class);
  }
}