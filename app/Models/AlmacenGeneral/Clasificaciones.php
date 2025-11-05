<?php

namespace App\Models\AlmacenGeneral;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Clasificaciones extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'almacengeneral.tableRef_ClasificacionesAF'; // Especifica el nombre de la tabla
    protected $primaryKey = 'id_clasificacion'; // Especifica el campo de la clave primaria

    protected $fillable = [
        'descripcion_clasificacionaf',
        'estatus_activo',

    ];

    // Conversiones de tipos de campos
    protected $casts = [
        'estatus_activo' => 'boolean', // Convierte el campo 'estatus_activo' a booleano
    ];
}
