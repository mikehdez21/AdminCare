<?php

namespace App\Models\AlmacenGeneral;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\TieneArchivos;


class ActivosFijos extends Model
{
    use HasFactory, HasApiTokens, TieneArchivos;

    protected $table = 'almacengeneral.tableAF_activos_fijos';
    protected $primaryKey = 'id_activo_fijo';

    protected $fillable = [
        'codigo_unico',
        'nombre_af',
        'descripcion_af',
        'modelo_af',
        'marca_af',
        'serie_af',
        'valor_compra_af',
        'fecha_compra_af',
        'id_estado_af',
        'id_clasificacion',
        'id_ubicacion',
        'id_responsable',
        'id_departamento',
        'fecha_registro_af',
        'observaciones_af',
    ];

    // Relación con la clasificación
    public function clasificacion()
    {
        return $this->belongsTo(
            \App\Models\AlmacenGeneral\Clasificaciones::class,
            'id_clasificacion',
            'id_clasificacion'
        );
    }

    // Relación con la ubicación
    public function ubicacion()
    {
        return $this->belongsTo(
            \App\Models\AlmacenGeneral\Ubicaciones::class,
            'id_ubicacion',
            'id_ubicacion'
        );
    }

    // Relación con el responsable (empleado)
    public function responsable()
    {
        return $this->belongsTo(
            \App\Models\Empleado::class,
            'id_empleado',
            'id_responsable'
        );
    }

    // Relación con el departamento
    public function departamento()
    {
        return $this->belongsTo(
            \App\Models\Departamento::class,
            'id_departamento',
            'id_departamento'
        );
    }
}