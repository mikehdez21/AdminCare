<?php

namespace App\Models\Helpdesk;

use App\Models\Concerns\UsesHelpdeskTable;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TituloTicket extends Model
{
    use UsesHelpdeskTable;

    use HasFactory;

    protected $table = 'helpdesk.tableRef_TitulosTicket';

    protected $primaryKey = 'id_titulo_ticket';

    protected $fillable = [
        'id_subcategoria_ticket',
        'nombre_titulo_ticket',
        'descripcion_titulo_ticket',
        'estatus_activo',
    ];

    protected $casts = [
        'estatus_activo' => 'boolean',
    ];

    public function subcategoria(): BelongsTo
    {
        return $this->belongsTo(SubcategoriaTicket::class, 'id_subcategoria_ticket', 'id_subcategoria_ticket');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'id_titulo_ticket', 'id_titulo_ticket');
    }

    public function scopeActivos($query)
    {
        return $query->where('estatus_activo', true);
    }
}
