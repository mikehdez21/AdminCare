<?php

namespace App\Models\Helpdesk;

use App\Models\Concerns\UsesHelpdeskTable;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Sistema de un proveedor de error. Hoy solo Reliv tiene (SIHO / ECE / Surfing):
 * el desplegable de "Sistema" se llena con los del proveedor elegido.
 */
class SistemaProveedor extends Model
{
    use UsesHelpdeskTable;

    use HasFactory;

    protected $table = 'helpdesk.tableMA_SistemasProveedor';

    protected $primaryKey = 'id_sistema_proveedor';

    protected $fillable = [
        'id_proveedor_error',
        'nombre_sistema_proveedor',
        'estatus_activo',
    ];

    protected $casts = [
        'estatus_activo' => 'boolean',
    ];

    public function proveedorError(): BelongsTo
    {
        return $this->belongsTo(ProveedorError::class, 'id_proveedor_error', 'id_proveedor_error');
    }

    public function scopeActivos($query)
    {
        return $query->where('estatus_activo', true);
    }
}
