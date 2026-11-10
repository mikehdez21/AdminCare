<?php

namespace App\Models\Helpdesk;

use App\Models\Concerns\UsesHelpdeskTable;

use App\Models\Empleado;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Personas que atienden un ticket: el responsable espejado más hasta cuatro
 * colaboradores.
 *
 * Es una fila por ticket (1:1). El responsable vive además en
 * `Tickets.id_responsable`, que es la columna que manda —filtro, auto-estatus y
 * `Ticket::esAtendientePor`—; aquí se guarda el mismo valor para poder listar a
 * todos los que participan sin tocar la tabla de tickets. La sincronización la
 * hace `TicketService`.
 */
class TicketTecnico extends Model
{
    use UsesHelpdeskTable;

    use HasFactory;

    protected $table = 'helpdesk.tableInter_ticketsTecnicos';

    protected $primaryKey = 'id_ticket_tecnico';

    protected $fillable = [
        'id_ticket',
        'id_responsable',
        'id_tecnico_dos',
        'id_tecnico_tres',
        'id_tecnico_cuatro',
        'id_tecnico_cinco',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class, 'id_ticket', 'id_ticket');
    }

    public function responsable(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_responsable', 'id_empleado');
    }

    public function tecnicoDos(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_tecnico_dos', 'id_empleado');
    }

    public function tecnicoTres(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_tecnico_tres', 'id_empleado');
    }

    public function tecnicoCuatro(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_tecnico_cuatro', 'id_empleado');
    }

    public function tecnicoCinco(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_tecnico_cinco', 'id_empleado');
    }
}
