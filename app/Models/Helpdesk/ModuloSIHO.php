<?php

namespace App\Models\Helpdesk;

use App\Models\Concerns\UsesHelpdeskTable;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Módulo de SIHO, para el desplegable de "Módulo" de un error de proveedor.
 *
 * Es un catálogo plano: los módulos son los del sistema, no de cada proveedor.
 */
class ModuloSIHO extends Model
{
    use UsesHelpdeskTable;

    use HasFactory;

    protected $table = 'helpdesk.tableMA_ModulosSIHO';

    protected $primaryKey = 'id_modulo_siho';

    protected $fillable = [
        'nombre_modulo',
        'estatus_activo',
    ];

    protected $casts = [
        'estatus_activo' => 'boolean',
    ];

    public function scopeActivos($query)
    {
        return $query->where('estatus_activo', true);
    }
}
