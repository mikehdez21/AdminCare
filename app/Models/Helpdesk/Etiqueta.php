<?php

namespace App\Models\Helpdesk;

use App\Models\Concerns\UsesHelpdeskTable;
use App\Support\SchemaTable;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Etiqueta extends Model
{
    use UsesHelpdeskTable;

    use HasFactory;

    protected $table = 'helpdesk.tableMA_Etiquetas';

    protected $primaryKey = 'id_etiqueta';

    protected $fillable = [
        'nombre_etiqueta',
        'color',
    ];

    public function tickets(): BelongsToMany
    {
        return $this->belongsToMany(
            Ticket::class,
            SchemaTable::helpdesk('tableInter_ticketsEtiquetas'),
            'id_etiqueta',
            'id_ticket',
            'id_etiqueta',
            'id_ticket'
        );
    }
}
