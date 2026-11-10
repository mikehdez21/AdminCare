<?php

namespace App\Models\Helpdesk;

use App\Models\Concerns\UsesHelpdeskTable;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EstatusTicket extends Model
{
    use UsesHelpdeskTable;

    use HasFactory;

    protected $table = 'helpdesk.tableRef_EstatusTicket';

    protected $primaryKey = 'id_estatus_ticket';

    protected $fillable = [
        'nombre_estatus',
        'descripcion_estatus',
        'es_estado_final',
        'orden_flujo',
        'color',
    ];

    protected $casts = [
        'es_estado_final' => 'boolean',
        'orden_flujo' => 'integer',
    ];

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'id_estatus_ticket', 'id_estatus_ticket');
    }
}
