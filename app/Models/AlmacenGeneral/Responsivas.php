<?php

namespace App\Models\AlmacenGeneral;

use Illuminate\Database\Eloquent\Model;

class Responsiva extends Model
{
    protected $table = 'almacengeneral.tableAF_Responsivas';
    protected $primaryKey = 'id_responsiva';

    protected $fillable = [
        'codigo_responsiva',
        'id_empleado',
        'fecha_entrega',
        'fecha_devolucion_estimada',
        'fecha_devolucion_real',
        'tipo_responsiva',
        'estado',
        'descripcion',
        'observaciones',
        'id_usuario_registro',
        'id_usuario_autoriza',
        'fecha_registro',
    ];

    protected $casts = [
        'fecha_entrega' => 'date',
        'fecha_devolucion_estimada' => 'date',
        'fecha_devolucion_real' => 'date',
        'fecha_registro' => 'date',
    ];

    // Relación con empleado
    public function empleado()
    {
        return $this->belongsTo(\App\Models\Empleados::class, 'id_empleado', 'id_empleado');
    }

    // Relación con usuario que registra
    public function usuarioRegistro()
    {
        return $this->belongsTo(\App\Models\Usuarios::class, 'id_usuario_registro', 'id_usuario');
    }

    // Relación con usuario que autoriza
    public function usuarioAutoriza()
    {
        return $this->belongsTo(\App\Models\Usuarios::class, 'id_usuario_autoriza', 'id_usuario');
    }

    // Relación con detalles
    public function detalles()
    {
        return $this->hasMany(DetalleResponsiva::class, 'id_responsiva', 'id_responsiva');
    }

    // Scope para responsivas activas
    public function scopeActivas($query)
    {
        return $query->where('estado', 'Activa');
    }

    // Generar código automático
    public static function generarCodigo($tipoResponsiva)
    {
        $prefijo = match($tipoResponsiva) {
            'Asignación' => 'RESP-ASG',
            'Temporal' => 'RESP-TMP',
            'Proyecto' => 'RESP-PRY',
            'Baja' => 'RESP-BAJA',
            default => 'RESP',
        };
        
        $ultimoId = self::max('id_responsiva') ?? 0;
        return $prefijo . '-' . date('Y') . '-' . str_pad($ultimoId + 1, 4, '0', STR_PAD_LEFT);
    }
}