<?php

namespace App\Models\Helpdesk;

use App\Models\Concerns\UsesHelpdeskTable;

use App\Models\Departamento;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Proveedor al que se le atribuye (o que resuelve) un error de proveedor.
 *
 * `requiere_sistema` es el switch del catálogo: cuando está encendido, capturar el
 * error de este proveedor pide sistema, no. de ticket externo, módulo y personal
 * SAC. Reliv lo tiene encendido; el resto solo se relaciona con el ticket.
 *
 * HSS vive aquí también: `ErroresProveedor.id_soluciona_error` apunta a este mismo
 * catálogo, así que quien resuelve sale de la misma lista.
 */
class ProveedorError extends Model
{
    use UsesHelpdeskTable;

    use HasFactory;

    protected $table = 'helpdesk.tableMA_ProveedoresError';

    protected $primaryKey = 'id_proveedor_error';

    protected $fillable = [
        'nombre_proveedor_error',
        'id_departamento',
        'requiere_sistema',
        'estatus_activo',
    ];

    protected $casts = [
        'requiere_sistema' => 'boolean',
        'estatus_activo' => 'boolean',
    ];

    public function departamento(): BelongsTo
    {
        return $this->belongsTo(Departamento::class, 'id_departamento', 'id_departamento');
    }

    public function sistemas(): HasMany
    {
        return $this->hasMany(SistemaProveedor::class, 'id_proveedor_error', 'id_proveedor_error');
    }

    public function scopeActivos($query)
    {
        return $query->where('estatus_activo', true);
    }
}
