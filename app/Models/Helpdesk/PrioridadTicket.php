<?php

namespace App\Models\Helpdesk;

use App\Models\Concerns\UsesHelpdeskTable;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PrioridadTicket extends Model
{
    use UsesHelpdeskTable;

    use HasFactory;

    protected $table = 'helpdesk.tableRef_PrioridadesTicket';

    protected $primaryKey = 'id_prioridad_ticket';

    protected $fillable = [
        'nombre_prioridad',
        'descripcion_prioridad',
        'nivel_prioridad',
        'color',
        'estatus_activo',
    ];

    protected $casts = [
        'nivel_prioridad' => 'integer',
        'estatus_activo' => 'boolean',
    ];

    /**
     * SLA asociado a la prioridad: de aquí salen los límites de respuesta y de
     * resolución que se calculan al crear el ticket.
     */
    public function sla(): HasOne
    {
        return $this->hasOne(SLANivel::class, 'id_prioridad_ticket', 'id_prioridad_ticket');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'id_prioridad_ticket', 'id_prioridad_ticket');
    }

    public function scopeActivos($query)
    {
        return $query->where('estatus_activo', true);
    }
}
