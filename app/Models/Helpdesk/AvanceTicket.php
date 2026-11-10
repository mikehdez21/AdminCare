<?php

namespace App\Models\Helpdesk;

use App\Models\Concerns\UsesHelpdeskTable;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AvanceTicket extends Model
{
    use UsesHelpdeskTable;

    use HasFactory, SoftDeletes;

    protected $table = 'helpdesk.tableMA_AvancesTicket';

    protected $primaryKey = 'id_avance_ticket';

    /** La tabla llama `fecha_eliminado` a la marca de baja lógica. */
    public const DELETED_AT = 'fecha_eliminado';

    protected $fillable = [
        'id_ticket',
        'id_usuario_autor',
        'contenido_avance',
        'es_interno',
    ];

    protected $casts = [
        'es_interno' => 'boolean',
        'fecha_eliminado' => 'datetime',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class, 'id_ticket', 'id_ticket');
    }

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario_autor', 'id_usuario');
    }

    /** Avances que el solicitante puede ver: solo los que no son notas internas. */
    public function scopeVisiblesParaSolicitante($query)
    {
        return $query->where('es_interno', false);
    }
}
