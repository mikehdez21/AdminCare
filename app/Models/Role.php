<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Role extends SpatieRole
{
    use HasFactory;

    protected $table = 'roles'; // Especifica la tabla si no sigue la convención de Laravel

    protected $fillable = [
        'name',
        'guard_name',
    ];

    // Puedes agregar relaciones aquí si es necesario
}
