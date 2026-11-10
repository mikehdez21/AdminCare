<?php

namespace App\Models\Helpdesk;

use App\Models\Concerns\UsesHelpdeskTable;

use App\Models\Departamento;
use App\Models\Empleado;
use App\Models\Ubicacion;
use App\Models\User;
use App\Observers\TicketObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

/**
 * Sin el trait `TieneArchivos`: ningún endpoint de HD-02 expone el archivo, y su
 * `agregarAdjunto()` escribe en `ArchivosDigitales` usando `auth()->id()` sin
 * comprobar nada, es decir un método de escritura sin autorización propia. Cuando
 * exista el endpoint de adjuntos debe venir con su authz.
 */
#[ObservedBy([TicketObserver::class])]
class Ticket extends Model
{
    use UsesHelpdeskTable;

    use HasFactory;

    protected $table = 'helpdesk.tableMA_Tickets';

    protected $primaryKey = 'id_ticket';

    /**
     * Solo las columnas que un cliente puede fijar legítimamente. Todo lo demás
     * (folio, clasificación derivada, solicitante, responsable, departamento y fechas
     * del ciclo de vida) lo calcula `TicketService`: dejarlo fuera de `$fillable`
     * impide que un `update($request->all())` futuro escale privilegios.
     */
    protected $fillable = [
        'descripcion_ticket',
        'id_prioridad_ticket',
        'id_ubicacion',
    ];

    protected $casts = [
        'ticket_reapertura' => 'boolean',
        'error_proveedor' => 'boolean',
        'personal_sac' => 'boolean',
        'fecha_primer_respuesta' => 'datetime',
        'fecha_resolucion' => 'datetime',
        'fecha_cierre' => 'datetime',
        'fecha_limite_respuesta' => 'datetime',
        'fecha_limite_resolucion' => 'datetime',
        'fecha_reapertura' => 'datetime',
    ];

    // === CATÁLOGOS ===

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaTicket::class, 'id_categoria_ticket', 'id_categoria_ticket');
    }

    public function subcategoria(): BelongsTo
    {
        return $this->belongsTo(SubcategoriaTicket::class, 'id_subcategoria_ticket', 'id_subcategoria_ticket');
    }

    public function titulo(): BelongsTo
    {
        return $this->belongsTo(TituloTicket::class, 'id_titulo_ticket', 'id_titulo_ticket');
    }

    public function prioridad(): BelongsTo
    {
        return $this->belongsTo(PrioridadTicket::class, 'id_prioridad_ticket', 'id_prioridad_ticket');
    }

    public function estatus(): BelongsTo
    {
        return $this->belongsTo(EstatusTicket::class, 'id_estatus_ticket', 'id_estatus_ticket');
    }

    // === ORGANIZACIÓN ===

    public function solicitante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario_solicitante', 'id_usuario');
    }

    /**
     * Empleado en cuyo nombre se levantó el ticket. Una cuenta normal lo hereda de
     * su usuario; una cuenta compartida elige uno de su departamento al crear.
     */
    public function empleadoSolicitante(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_empleado_solicitante', 'id_empleado');
    }

    /**
     * Departamento del solicitante.
     *
     * No hay columna propia en el ticket: el departamento es el del usuario que lo
     * abrió, y ese dato ya vive en `tableUsuarios.id_departamento`. Se resuelve
     * por `hasOneThrough` en vez de con un `belongsTo` a una columna que ya no
     * existe.
     *
     * El departamento que *atiende* el ticket es otro y no vive aquí: es el
     * `id_departamento_default` de la categoría, y se lee por `categoria()`.
     */
    public function departamento(): HasOneThrough
    {
        return $this->hasOneThrough(
            Departamento::class,
            User::class,
            'id_usuario',
            'id_departamento',
            'id_usuario_solicitante',
            'id_departamento'
        );
    }

    /**
     * Responsable de atender el ticket. Es la persona que manda: dispara el
     * auto-estatus, el filtro de la mesa y la autorización de `esAtendientePor`.
     */
    public function tecnico(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_responsable', 'id_empleado');
    }

    /**
     * Responsable espejado más los colaboradores (hasta cuatro). Es información de
     * apoyo: no cambia el estatus ni autoriza nada por sí sola.
     */
    public function tecnicos(): HasOne
    {
        return $this->hasOne(TicketTecnico::class, 'id_ticket', 'id_ticket');
    }

    /**
     * Error de proveedor del ticket: proveedor, quién lo resuelve, sistema, no. de
     * ticket externo, módulo y personal SAC. Una fila por ticket, y solo existe
     * cuando la bandera `error_proveedor` está encendida.
     *
     * Se llama `...Detalle` y no `errorProveedor` a propósito: la relación no puede
     * compartir nombre con la columna booleana, o en el JSON una pisa a la otra.
     */
    public function errorProveedorDetalle(): HasOne
    {
        return $this->hasOne(ErrorProveedor::class, 'id_ticket', 'id_ticket');
    }

    public function ubicacion(): BelongsTo
    {
        return $this->belongsTo(Ubicacion::class, 'id_ubicacion', 'id_ubicacion');
    }

    // === BITÁCORA ===

    public function actividades(): HasMany
    {
        return $this->hasMany(ActividadTicket::class, 'id_ticket', 'id_ticket');
    }

    public function avances(): HasMany
    {
        return $this->hasMany(AvanceTicket::class, 'id_ticket', 'id_ticket');
    }

    public function encuesta(): HasOne
    {
        return $this->hasOne(EncuestaSatisfaccion::class, 'id_ticket', 'id_ticket');
    }

    public function etiquetas(): BelongsToMany
    {
        return $this->belongsToMany(
            Etiqueta::class,
            'helpdesk.tableInter_ticketsEtiquetas',
            'id_ticket',
            'id_etiqueta',
            'id_ticket',
            'id_etiqueta'
        );
    }

    // === REGLAS DE NEGOCIO ===

    /**
     * Es el técnico que tiene el ticket asignado, y solo después de tomarlo con
     * `PUT helpdesk/tickets/{id}/tecnicos`.
     *
     * Ser del departamento que atiende el ticket da acceso de *lectura* a la cola de
     * ese departamento (eso lo decide `TicketService::scopeVisibleA`), no de
     * atendiente. Antes el departamento era un atajo aquí y cualquier técnico del
     * departamento leía las notas internas de tickets que tenía asignados otro, y
     * podía escribirlas sin haberlos tomado nunca.
     *
     * El solicitante queda fuera de esta puerta a propósito: ser el técnico asignado
     * de un ticket propio no basta, porque asignar no exige `atiende_helpdesk`. Entra
     * por la regla de categoría (`atiendeLaCategoriaDelTicket`) cuando sí atiende
     * tickets y su departamento es el que atiende la categoría.
     */
    public function esAtendientePor(User $usuario): bool
    {
        if ((int) $usuario->id_usuario === (int) $this->id_usuario_solicitante) {
            return false;
        }

        return $this->id_responsable !== null
            && ! empty($usuario->id_empleado)
            && (int) $usuario->id_empleado === (int) $this->id_responsable;
    }

    // === SCOPES ===

    public function scopeConDetalle($query)
    {
        return $query->with([
            // `id_departamento_default` viene en el select porque
            // `TicketService::atiendeLaCategoriaDelTicket` decide con él, y sin la
            // columna el atributo llega en null y el técnico del área no puede ver ni
            // gestionar el ticket.
            'categoria:id_categoria_ticket,nombre_categoria,id_departamento_default',
            'subcategoria:id_subcategoria_ticket,nombre_subcategoria',
            'titulo:id_titulo_ticket,nombre_titulo_ticket',
            'prioridad:id_prioridad_ticket,nombre_prioridad,nivel_prioridad,color',
            'estatus:id_estatus_ticket,nombre_estatus,color,orden_flujo,es_estado_final',
            'solicitante:id_usuario,nombre_usuario,id_departamento,id_empleado',
            'empleadoSolicitante:id_empleado,nombre_empleado,apellido_paterno,apellido_materno',
            'tecnico:id_empleado,nombre_empleado,apellido_paterno,apellido_materno',
            // El responsable espejado y los cuatro colaboradores. Cada hueco trae su
            // empleado para que la UI arme la lista sin otra consulta.
            'tecnicos' => fn ($q) => $q->with([
                'responsable:id_empleado,nombre_empleado,apellido_paterno,apellido_materno',
                'tecnicoDos:id_empleado,nombre_empleado,apellido_paterno,apellido_materno',
                'tecnicoTres:id_empleado,nombre_empleado,apellido_paterno,apellido_materno',
                'tecnicoCuatro:id_empleado,nombre_empleado,apellido_paterno,apellido_materno',
                'tecnicoCinco:id_empleado,nombre_empleado,apellido_paterno,apellido_materno',
            ]),
            // Error de proveedor con sus catálogos, para que el detalle arme la
            // sección sin otra consulta.
            'errorProveedorDetalle' => fn ($q) => $q->with([
                'proveedorError:id_proveedor_error,nombre_proveedor_error,requiere_sistema',
                'solucionaError:id_proveedor_error,nombre_proveedor_error',
                'sistema:id_sistema_proveedor,nombre_sistema_proveedor',
                'modulo:id_modulo_siho,nombre_modulo',
            ]),
            // `departamento` se carga con las columnas calificadas: la relación hace
            // `join` contra `tableUsuarios` y las dos tablas tienen `id_departamento`,
            // así que sin el prefijo PostgreSQL lo toma como ambiguo.
            'departamento:tableDepartamentos.id_departamento,tableDepartamentos.nombre_departamento',
            'ubicacion:id_ubicacion,nombre_ubicacion',
            'etiquetas:id_etiqueta,nombre_etiqueta,color',
        ]);
    }

    /**
     * Recarga el ticket con el detalle de relaciones aplicado.
     *
     * No usar `$modelo->conDetalle()` sobre una instancia: `conDetalle` es un scope
     * local, así que Eloquent abre una consulta nueva sin filtro y `->first()`
     * devolvería el ticket de menor id de toda la tabla en vez del modelo actual.
     */
    public function recargarConDetalle(): self
    {
        return static::conDetalle()->findOrFail($this->getKey());
    }

    public function scopeDelSolicitante($query, int $usuarioId)
    {
        return $query->where('id_usuario_solicitante', $usuarioId);
    }

    /**
     * Tickets abiertos por usuarios de un departamento.
     *
     * Filtra por el departamento del solicitante y no por una columna del ticket:
     * se resuelve con `whereHas` para no depender de un JOIN en cada consulta.
     */
    public function scopeDelDepartamento($query, int $departamentoId)
    {
        return $query->whereHas('solicitante', fn ($q) => $q->where('id_departamento', $departamentoId));
    }
}
