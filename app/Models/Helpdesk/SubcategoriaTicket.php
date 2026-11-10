<?php

namespace App\Models\Helpdesk;

use App\Models\Concerns\UsesHelpdeskTable;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubcategoriaTicket extends Model
{
    use UsesHelpdeskTable;

    use HasFactory;

    protected $table = 'helpdesk.tableRef_SubcategoriasTicket';

    protected $primaryKey = 'id_subcategoria_ticket';

    protected $fillable = [
        'id_categoria_ticket',
        'nombre_subcategoria',
        'descripcion_subcategoria',
        'estatus_activo',
        'es_publico',
    ];

    protected $casts = [
        'estatus_activo' => 'boolean',
        'es_publico' => 'boolean',
    ];

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaTicket::class, 'id_categoria_ticket', 'id_categoria_ticket');
    }

    public function titulos(): HasMany
    {
        return $this->hasMany(TituloTicket::class, 'id_subcategoria_ticket', 'id_subcategoria_ticket');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'id_subcategoria_ticket', 'id_subcategoria_ticket');
    }

    public function scopeActivos($query)
    {
        return $query->where('estatus_activo', true);
    }
}
