<?php

namespace App\Models\Helpdesk;

use App\Models\Concerns\UsesHelpdeskTable;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SLANivel extends Model
{
    use UsesHelpdeskTable;

    use HasFactory;

    protected $table = 'helpdesk.tableRef_SLANiveles';

    protected $primaryKey = 'id_sla_nivel';

    protected $fillable = [
        'id_prioridad_ticket',
        'tiempo_respuesta_horas',
        'tiempo_resolucion_horas',
        'descripcion_sla',
        'estatus_activo',
    ];

    protected $casts = [
        'tiempo_respuesta_horas' => 'float',
        'tiempo_resolucion_horas' => 'float',
        'estatus_activo' => 'boolean',
    ];

    public function prioridad(): BelongsTo
    {
        return $this->belongsTo(PrioridadTicket::class, 'id_prioridad_ticket', 'id_prioridad_ticket');
    }

    /** Solo los SLA vigentes calculan tiempos de respuesta y resolución. */
    public function scopeActivos($query)
    {
        return $query->where('estatus_activo', true);
    }
}
