<?php

namespace App\Models\AlmacenGeneral;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\AlmacenGeneral\MetodoDepreciacion;
use App\Models\AlmacenGeneral\ActivosFijos;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Depreciacion extends Model
{

    use HasFactory, HasApiTokens;

    protected $table = 'almacengeneral.tableAF_DepreciacionActivo';
    protected $primaryKey = 'id_depreciacionaf';

    protected $fillable = [
        'id_activo_fijo',
        'anio_depreciacionaf',
        'valor_inicialaf',
        'valor_depreciacion_anterior',
        'valor_depreciacion_acumulada',
        'valor_depreciacion_anual',
        'valor_libros_af',
        'metodo_depreciacionaf',
        'id_metodo_depreciacionaf',
        'fecha_inicio_depreciacion',
        'vida_util_anios',
        'valor_residual_af',
        'id_estatus_depreciacion',
        'fecha_calculo_depreciacion',
        'id_usuario_calculo',
        'observaciones_depreciacionaf'
    ];

    protected $casts = [
        'fecha_calculo_depreciacion' => 'datetime',
        'valor_inicialaf' => 'decimal:2',
        'valor_depreciacion_anual' => 'decimal:2',
        'valor_depreciacion_acumulada' => 'decimal:2',
        'valor_libros_af' => 'decimal:2',
        'vida_util_anios' => 'integer',
        'valor_residual_af' => 'decimal:2',
    ];

    public function metodoDepreciacion()
    {
        
        return $this->belongsTo(MetodoDepreciacion::class, 'id_metodo_depreciacionaf', 'id_metodo_depreciacion');
    }

    public function activoFijo(): BelongsTo
    {
        return $this->belongsTo(ActivosFijos::class, 'id_activo_fijo');
    }

    public function usuarioCalculo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario_calculo');
    }
}
