<?php

namespace App\Models\Helpdesk;

use App\Models\Concerns\UsesHelpdeskTable;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EncuestaSatisfaccion extends Model
{
    use UsesHelpdeskTable;

    use HasFactory;

    protected $table = 'helpdesk.tableMA_EncuestaSatisfaccion';

    protected $primaryKey = 'id_encuesta_satisfaccion';

    protected $fillable = [
        'id_ticket',
        'calificacion',
        'comentario_satisfaccion',
        'id_usuario_evaluador',
    ];

    protected $casts = [
        'calificacion' => 'integer',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class, 'id_ticket', 'id_ticket');
    }

    public function evaluador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario_evaluador', 'id_usuario');
    }
}
