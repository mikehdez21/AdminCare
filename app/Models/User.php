<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

/**
 * @method \Laravel\Sanctum\PersonalAccessToken|null currentAccessToken()
 * @method \Illuminate\Database\Eloquent\Collection tokens()
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles, HasApiTokens;

    protected $table = 'tableUsuarios'; // Especifica el nombre de la tabla
    protected $primaryKey = 'id_usuario'; // Especifica el campo de la clave primaria

    protected $fillable = [
        'nombre_usuario',
        'email_usuario',
        'password',
        'estatus_activo',
        'fecha_baja',
        'usuario_compartido',
        'id_empleado',
        'id_departamento',
    ];

    // Conversiones de tipos de campos
    protected $casts = [
        'estatus_activo' => 'boolean', // Convierte el campo 'estatus_activo' a booleano
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'estatus_activo' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function empleado()
    {
        return $this->belongsTo(\App\Models\Empleado::class, 'id_empleado', 'id_empleado');
    }

    public function departamento()
    {
        return $this->belongsTo(\App\Models\Departamento::class, 'id_departamento', 'id_departamento');
    }
}
