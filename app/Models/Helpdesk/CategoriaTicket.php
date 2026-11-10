<?php

namespace App\Models\Helpdesk;

use App\Models\Concerns\UsesHelpdeskTable;

use App\Models\Departamento;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategoriaTicket extends Model
{
    use UsesHelpdeskTable;

    use HasFactory;

    protected $table = 'helpdesk.tableRef_CategoriasTicket';

    protected $primaryKey = 'id_categoria_ticket';

    protected $fillable = [
        'nombre_categoria',
        'descripcion_categoria',
        'id_departamento_default',
        'estatus_activo',
    ];

    protected $casts = [
        'estatus_activo' => 'boolean',
    ];

    /**
     * Departamento responsable de atender los tickets de la categoría: el área
     * que entra a la mesa por esta categoría.
     *
     * No se copia al ticket. El departamento *del* ticket es el del solicitante y
     * vive en el usuario; este es el que se muestra como "departamento que
     * atiende" y por el que se abre la cola.
     */
    public function departamentoDefault(): BelongsTo
    {
        return $this->belongsTo(Departamento::class, 'id_departamento_default', 'id_departamento');
    }

    public function subcategorias(): HasMany
    {
        return $this->hasMany(SubcategoriaTicket::class, 'id_categoria_ticket', 'id_categoria_ticket');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'id_categoria_ticket', 'id_categoria_ticket');
    }

    public function scopeActivos($query)
    {
        return $query->where('estatus_activo', true);
    }
}
