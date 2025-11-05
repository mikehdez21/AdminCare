<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ubicacion extends Model
{
    use HasFactory;

    protected $table = 'tableUbicaciones';

    protected $primaryKey = 'id_ubicacion';

    protected $fillable = [
        'nombre_ubicacion',
        'descripcion_ubicacion',
        'estatus_activo',
    ];

    // Conversiones de tipos de campos
    protected $casts = [
        'estatus_activo' => 'boolean', // Convierte el campo 'estatus_activo' a booleano
    ];
}
