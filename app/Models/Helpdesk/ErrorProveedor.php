<?php

namespace App\Models\Helpdesk;

use App\Models\Concerns\UsesHelpdeskTable;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Error de proveedor de un ticket: una fila por ticket (1:1).
 *
 * `id_proveedor_error` es quien lo causó y `id_soluciona_error` quien lo resuelve;
 * ambos salen del mismo catálogo, por eso HSS está ahí. Los campos de sistema, no.
 * de ticket externo, módulo y personal SAC solo aplican cuando el proveedor trae
 * `requiere_sistema` encendido (Reliv).
 */
class ErrorProveedor extends Model
{
    use UsesHelpdeskTable;

    use HasFactory;

    protected $table = 'helpdesk.tableMA_ErroresProveedor';

    protected $primaryKey = 'id_error_proveedor';

    protected $fillable = [
        'id_ticket',
        'id_proveedor_error',
        'id_soluciona_error',
        'id_sistema',
        'no_ticket_externo',
        'id_modulo_sistema',
        'personal_sac',
    ];

    protected $casts = [
        'personal_sac' => 'boolean',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class, 'id_ticket', 'id_ticket');
    }

    public function proveedorError(): BelongsTo
    {
        return $this->belongsTo(ProveedorError::class, 'id_proveedor_error', 'id_proveedor_error');
    }

    public function solucionaError(): BelongsTo
    {
        return $this->belongsTo(ProveedorError::class, 'id_soluciona_error', 'id_proveedor_error');
    }

    public function sistema(): BelongsTo
    {
        return $this->belongsTo(SistemaProveedor::class, 'id_sistema', 'id_sistema_proveedor');
    }

    public function modulo(): BelongsTo
    {
        return $this->belongsTo(ModuloSIHO::class, 'id_modulo_sistema', 'id_modulo_siho');
    }
}
