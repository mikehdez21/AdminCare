<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Permission\Models\Permission as SpatiePermission;

class Permission extends SpatiePermission
{
    use HasFactory;

    protected $table = 'permissions';

    protected $fillable = [
        'name',
        'guard_name',
        'lectura',
        'escritura',
        'control',
    ];

    protected $casts = [
        'lectura' => 'boolean',
        'escritura' => 'boolean',
        'control' => 'boolean',
    ];
}
