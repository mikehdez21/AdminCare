<?php

namespace App\Models\AlmacenGeneral;

use App\Models\Empleado;
use App\Models\Ubicacion;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class MovimientosActivos extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'almacengeneral.tableAF_MovimientosActivos';
    protected $primaryKey = 'id_movimientoAF';

    protected $fillable = [
        'id_activo_fijo',
        'id_tipo_movimiento',
        'motivo_movimiento',
        'fecha_movimiento',
        'id_responsable_anterior',
        'id_responsable_actual',
        'id_ubicacion_anterior',
        'id_ubicacion_actual',
        'id_usuario',
    ];

    public function responsableActual(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_responsable_actual', 'id_empleado');
    }

    public function responsableAnterior(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_responsable_anterior', 'id_empleado');
    }

    public function ubicacionActual(): BelongsTo
    {
        return $this->belongsTo(Ubicacion::class, 'id_ubicacion_actual', 'id_ubicacion');
    }

    public function ubicacionAnterior(): BelongsTo
    {
        return $this->belongsTo(Ubicacion::class, 'id_ubicacion_anterior', 'id_ubicacion');
    }
}
