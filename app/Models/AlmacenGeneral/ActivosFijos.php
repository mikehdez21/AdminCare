<?php

namespace App\Models\AlmacenGeneral;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;
use App\Models\AlmacenGeneral\CodigosQRAF;
use App\Traits\TieneArchivos;


class ActivosFijos extends Model
{
    use HasFactory, HasApiTokens, TieneArchivos;

    protected $table = 'almacengeneral.tableAF_ActivosFijos';
    protected $primaryKey = 'id_activo_fijo';
    protected $appends = [
        'ubicacion_actual',
    ];

    protected $fillable = [
        'codigo_unico',
        'codigo_etiqueta',
        'codigo_lote',
        'lote_afconsecutivo',
        'lote_total',
        'nombre_af',
        'descripcion_af',
        'modelo_af',
        'marca_af',
        'numero_serie_af',
        'precio_unitario_af',
        'af_propio',
        'id_estado_af',
        'id_clasificacion',
        'fecha_registro_af',
        'observaciones_af',
    ];

    // === EVENTOS DEL MODELO ===

    protected static function boot()
    {
        parent::boot();

        // Generar código único automáticamente antes de crear el registro
        static::creating(function ($activo) {
            if (empty($activo->codigo_unico)) {
                // Obtener el último ID y calcular el siguiente
                $ultimoId = self::max('id_activo_fijo') ?? 0;
                $siguienteId = $ultimoId + 1;

                // Generar código con formato AF1, AF2, etc.
                $activo->codigo_unico = 'AF' . $siguienteId;
            }
        });
    }

    // === RELACIONES DIRECTAS ===

    public function estado(): BelongsTo
    {
        return $this->belongsTo(EstatusActivosFijos::class, 'id_estado_af', 'id_estatusaf');
    }

    public function clasificacion(): BelongsTo
    {
        return $this->belongsTo(Clasificaciones::class, 'id_clasificacion', 'id_clasificacion');
    }

    public function codigosQR(): HasMany
    {
        return $this->hasMany(CodigosQRAF::class, 'id_activo_fijo', 'id_activo_fijo');
    }

    // === RELACIONES A TRAVÉS DE MOVIMIENTOS ===

    public function movimientos(): HasMany
    {
        return $this->hasMany(MovimientosActivos::class, 'id_activo_fijo', 'id_activo_fijo');
    }

    public function ultimoMovimiento()
    {
        return $this->hasOne(MovimientosActivos::class, 'id_activo_fijo', 'id_activo_fijo')
            ->latest('fecha_movimiento');
    }


    // === ATRIBUTOS CALCULADOS (ACCESSORS) ===

    public function getResponsableActualAttribute()
    {
        return $this->ultimoMovimiento?->responsableActual;
    }

    public function getDepartamentoActualAttribute()
    {
        return $this->ultimoMovimiento?->responsableActual?->departamento;
    }

    public function getUbicacionActualAttribute()
    {
        return $this->ultimoMovimiento?->ubicacionActual;
    }

    public function getFechaUltimoMovimientoAttribute()
    {
        return $this->ultimoMovimiento?->fecha_movimiento;
    }




    // === SCOPES PARA CONSULTAS COMUNES ===

    public function scopeConInformacionCompleta($query)
    {
        return $query->with([
            'estado',
            'clasificacion',
            'ultimoMovimiento.responsableActual.departamento',
            'ultimoMovimiento.ubicacionActual'
        ]);
    }

    public function scopePorDepartamento($query, $departamentoId)
    {
        return $query->whereHas('ultimoMovimiento.responsableActual', function ($q) use ($departamentoId) {
            $q->where('id_departamento', $departamentoId);
        });
    }

    public function scopePorUbicacion($query, $ubicacionId)
    {
        return $query->whereHas('ultimoMovimiento', function ($q) use ($ubicacionId) {
            $q->where('id_ubicacion_actual', $ubicacionId);
        });
    }

    public function scopePorClasificacion($query, $clasificacionId)
    {
        return $query->where('id_clasificacion', $clasificacionId);
    }

    public function scopePorResponsable($query, $empleadoId)
    {
        return $query->with([
            'ultimoMovimiento.ubicacionActual',
            'ultimoMovimiento.responsableActual',
        ])->whereHas('ultimoMovimiento', function ($q) use ($empleadoId) {
            $q->where('id_responsable_actual', $empleadoId);
        });
    }

    // Obtener los activos dados de baja
    public function scopeDadosDeBaja($query)
    {
        return $query->whereHas('estado', function ($q) {
            $q->where('descripcion_estatusaf', 'Dado de Baja');
        });
    }

    // Obtener los activos marcados como no propios
    public function scopeNoPropios($query)
    {
        return $query->where('af_propio', false);
    }



    /**
     * Crear un activo fijo con su código QR automáticamente
     * Incluye: creación en BD, generación de imagen y guardado en storage
     * 
     * @param array $datos Datos del activo fijo
     * @return array ['success' => bool, 'message' => string, 'data' => array]
     */
    public static function crearConQR(array $datos, bool $generarQR = true): array
    {
        try {
            unset($datos['codigo_unico']);
            $activo = self::create($datos);

            if ($generarQR) {
                $resultadoQR = CodigosQRAF::generarParaActivo($activo->id_activo_fijo);
                if (!$resultadoQR['success']) {
                    throw new \Exception('No se pudo generar el código QR: ' . $resultadoQR['message']);
                }
            }

            return [
                'success' => true,
                'message' => 'Activo fijo creado exitosamente.',
                'data' => $activo,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al crear el activo fijo: ' . $e->getMessage(),
                'data' => null,
            ];
        }
    }
}
