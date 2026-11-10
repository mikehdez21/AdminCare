<?php

namespace App\Models\Helpdesk;

use App\Models\Concerns\UsesHelpdeskTable;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActividadTicket extends Model
{
    use UsesHelpdeskTable;

    use HasFactory;

    protected $table = 'helpdesk.tableMA_ActividadTicket';

    protected $primaryKey = 'id_actividad_ticket';

    /**
     * El historial es inmutable: la tabla no tiene columna `updated_at`, así que
     * Eloquent debe escribir solo `created_at` en cada alta.
     */
    public const UPDATED_AT = null;

    protected $fillable = [
        'id_ticket',
        'id_usuario_actor',
        'tipo_actividad',
        'valor_anterior',
        'valor_nuevo',
        'descripcion_actividad',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class, 'id_ticket', 'id_ticket');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario_actor', 'id_usuario');
    }

    /**
     * Historial del ticket, de lo más nuevo a lo más viejo: es el orden con el que
     * se pinta en el detalle y el que hace que el tope de `TicketController` deje
     * fuera lo viejo y no lo reciente.
     *
     * El desempate por id no es decorativo: `created_at` se escribe con precisión de
     * segundos, así que las actividades de un mismo movimiento (estatus y
     * asignación) lo comparten y sin él saldrían en orden impredecible.
     */
    public function scopeReciente($query)
    {
        return $query->orderByDesc('created_at')->orderByDesc('id_actividad_ticket');
    }
}
