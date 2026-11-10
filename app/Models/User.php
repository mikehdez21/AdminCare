<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;

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
        'atiende_helpdesk',
        'id_empleado',
        'id_departamento',
    ];

    // Conversiones de tipos de campos
    protected $casts = [
        'estatus_activo' => 'boolean', // Convierte el campo 'estatus_activo' a booleano
        'atiende_helpdesk' => 'boolean',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'estatus_activo' => 'boolean',
            'atiende_helpdesk' => 'boolean',
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

    /**
     * Departamentos adicionales del usuario (migración 009).
     *
     * `id_departamento` sigue siendo el principal; este pivote suma las áreas
     * que el usuario también atiende. Lo lee `AlcanceService`.
     */
    public function departamentos(): BelongsToMany
    {
        return $this->belongsToMany(
            \App\Models\Departamento::class,
            'tableInter_usuariosDepartamentos',
            'id_usuario',
            'id_departamento'
        );
    }

    /**
     * Correo al que el trait `RoutesNotifications` envía las notificaciones por
     * correo. Su default es `$this->email`, columna que no existe en `tableUsuarios`
     * (aquí es `email_usuario`); sin este método el destinatario queda vacío y el
     * correo nunca sale.
     */
    public function routeNotificationForMail(): ?string
    {
        return $this->email_usuario;
    }

    /**
     * Usuarios que atienden Helpdesk en un departamento, activos y con correo.
     *
     * Con departamento nulo devuelve un conjunto vacío (nunca «todos»): sin un área
     * que atienda no hay a quién avisar, y fallar abierto mandaría correo a gente de
     * otras áreas.
     *
     * @param  int|null  $idDepartamento  Departamento que atiende la categoría.
     */
    public function scopeAtiendenHelpdesk(Builder $query, ?int $idDepartamento): Builder
    {
        if ($idDepartamento === null) {
            return $query->whereRaw('1 = 0');
        }

        return $query
            ->where('id_departamento', $idDepartamento)
            ->where('atiende_helpdesk', true)
            ->where('estatus_activo', true)
            ->whereNotNull('email_usuario')
            ->where('email_usuario', '!=', '');
    }

    /**
     * Usuarios con correo no nulo ni vacío.
     */
    public function scopeConCorreo(Builder $query): Builder
    {
        return $query->whereNotNull('email_usuario')->where('email_usuario', '!=', '');
    }
}
