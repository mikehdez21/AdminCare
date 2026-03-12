<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Departamento extends Model
{
    use HasFactory;

    // Especifica el nombre de la tabla
    protected $table = 'tableDepartamentos';

    // Especifica el campo de la clave primaria
    protected $primaryKey = 'id_departamento';

    // Campos que pueden ser asignados masivamente
    protected $fillable = [
        'nombre_departamento',
        'descripcion',
        'atiende_pacientes',
        'estatus_activo',
    ];

    // Conversiones de tipos de campos
    protected $casts = [
        'atiende_pacientes' => 'boolean', // Convierte el campo 'atiende_pacientes' a booleano
        'estatus_activo' => 'boolean', // Convierte el campo 'estatus_activo' a booleano
    ];

    // Relación con la tabla de usuarios (si existe)
    public function usuarios()
    {
        return $this->hasMany(\App\Models\User::class, 'id_departamento', 'id_departamento');
    }

    // Relación con la tabla de empleados (si existe un encargado)
    public function empleadoEncargado()
    {
        return $this->belongsTo(\App\Models\Empleado::class, 'id_empleado_encargado', 'id_empleado');
    }
}
