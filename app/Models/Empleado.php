<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empleado extends Model
{
    use HasFactory;

    // Especifica el nombre de la tabla
    protected $table = 'tableEmpleados';

    // Especifica el campo de la clave primaria
    protected $primaryKey = 'id_empleado';

    // Campos que pueden ser asignados masivamente
    protected $fillable = [
        'nombre_empleado',
        'apellido_paterno',
        'apellido_materno',
        'email_empleado',
        'telefono_empleado',
        'genero',
        'fecha_nacimiento',
        'estatus_activo',
        'fecha_alta',
        'fecha_baja',
        'foto_empleado',
        'firma_movimientos',
        'id_departamento',
    ];

    // Campos que deben estar ocultos en las respuestas JSON
    protected $hidden = [
        // Si hay campos sensibles que no deben exponerse, como 'firma_movimientos', se pueden agregar aquí
    ];

    // Conversiones de tipos de campos
    protected $casts = [
        'estatus_activo' => 'boolean', // Convierte el campo 'estatus_activo' a booleano
        'fecha_nacimiento' => 'date', // Convierte el campo 'fecha_nacimiento' a tipo fecha
    ];

    // Relación con la tabla de departamentos (si existe)
    public function departamento()
    {
        return $this->belongsTo(\App\Models\Departamento::class, 'id_departamento', 'id_departamento');
    }

    // Relación con la tabla de usuarios (si existe)
    public function usuarios()
    {
        return $this->hasMany(\App\Models\User::class, 'id_empleado', 'id_empleado');
    }
}
