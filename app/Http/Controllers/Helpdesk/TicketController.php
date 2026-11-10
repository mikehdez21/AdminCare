<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Concerns\Paginable;
use App\Http\Controllers\Controller;
use App\Models\Departamento;
use App\Models\Helpdesk\CategoriaTicket;
use App\Models\Helpdesk\EstatusTicket;
use App\Models\Helpdesk\Etiqueta;
use App\Models\Helpdesk\ModuloSIHO;
use App\Models\Helpdesk\PrioridadTicket;
use App\Models\Helpdesk\ProveedorError;
use App\Models\Helpdesk\SistemaProveedor;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TituloTicket;
use App\Models\Ubicacion;
use App\Services\Helpdesk\AvanceService;
use App\Services\Helpdesk\TicketQueryService;
use App\Services\Helpdesk\TicketService;
use App\Support\Permisos;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TicketController extends Controller
{
    use Paginable;
    use ValidatesRequests;

    /** Página por defecto del listado: sin `per_page` no se devuelve la tabla entera. */
    private const POR_PAGINA = 15;

    /**
     * Tope de actividades y avances en el detalle. Sin él, la bitácora de un ticket
     * de un año entra completa en la respuesta.
     */
    private const LIMITE_BITACORA = 100;

    public function __construct(
        private readonly TicketService $ticketService,
        private readonly TicketQueryService $ticketQueryService,
        private readonly AvanceService $avanceService,
    ) {}

    /**
     * Listado paginado con filtros combinados.
     *
     * El recorte de alcance no está aquí sino en `TicketService::scopeVisibleA`, el
     * mismo que usa `buscarVisible`: quien administra ve todos los tickets, un técnico
     * ve la cola de su departamento y el resto solo los suyos.
     */
    public function index(Request $request)
    {
        $usuario = $request->user();

        // `Paginable` solo pagina cuando el request trae `per_page`; se normaliza aquí
        // para que este listado nunca caiga en la lista completa.
        $porPagina = $request->query('per_page');
        $request->query->set('per_page', is_numeric($porPagina) && (int) $porPagina > 0 ? (int) $porPagina : self::POR_PAGINA);

        $resultado = $this->paginar(
            $request,
            $this->ticketService->scopeVisibleA(
                $this->ticketQueryService->listarTickets($request->query()),
                $usuario
            ),
            ['folio_ticket', 'titulo_ticket', 'descripcion_ticket'],
            self::POR_PAGINA
        );

        $items = $resultado['items'];
        $meta = $resultado['meta'];

        return response()->json([
            'success' => true,
            'message' => 'Tickets obtenidos correctamente.',
            'data' => $items,
            'meta' => $meta,
        ], 200);
    }

    /**
     * Crea un ticket. El solicitante elige el título del catálogo; el backend
     * resuelve el snapshot del título, su subcategoría y el departamento.
     */
    public function store(Request $request)
    {
        $data = $this->validate($request, [
            'descripcion_ticket' => 'required|string|min:10',
            'id_categoria_ticket' => ['required', 'integer', Rule::exists(CategoriaTicket::class, 'id_categoria_ticket')],
            'id_titulo_ticket' => ['required', 'integer', Rule::exists(TituloTicket::class, 'id_titulo_ticket')],
            'id_prioridad_ticket' => ['required', 'integer', Rule::exists(PrioridadTicket::class, 'id_prioridad_ticket')],
            'id_empleado_solicitante' => ['nullable', 'integer', Rule::exists('tableEmpleados', 'id_empleado')->where('estatus_activo', true)],
            'id_ubicacion' => ['required', 'integer', Rule::exists(Ubicacion::class, 'id_ubicacion')],
            'etiquetas' => 'nullable|array',
            'etiquetas.*' => ['integer', Rule::exists(Etiqueta::class, 'id_etiqueta')],
        ]);

        $ticket = $this->ticketService->crearTicket($data, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Ticket creado exitosamente.',
            'data' => $ticket->recargarConDetalle(),
        ], 201);
    }

    /**
     * Detalle del ticket con su historial de actividad, sus avances visibles
     * para quien consulta y la encuesta de satisfacción.
     */
    public function show(Request $request, $id)
    {
        $usuario = $request->user();

        // Lookup acotado a lo que el usuario puede ver: un ticket ajeno se responde
        // 404, igual que uno inexistente, para no confirmar su existencia por id.
        $ticket = $this->ticketService->buscarVisible($id, $usuario);

        // El detalle recarga las relaciones del scope `conDetalle`: el lookup acotado
        // devuelve el modelo pelado y la respuesta perdía catálogos y nombres.
        $ticket = $ticket->recargarConDetalle();

        // Las notas internas son del técnico que tiene el ticket asignado, de quien
        // tiene la gestión interna del Helpdesk y del técnico del área que atiende la
        // categoría. Tener lectura de la cola sin atender Helpdesk no basta.
        $veNotasInternas = $ticket->esAtendientePor($usuario)
            || Permisos::tiene($usuario, 'helpdesk.internas', 'lectura')
            || $this->ticketService->atiendeLaCategoriaDelTicket($ticket, $usuario);

        $ticket->load([
            'actividades' => fn ($q) => $q->with('actor:id_usuario,nombre_usuario')
                // `registrarActividad` anota cada nota interna como
                // `avance_registrado` / `nota interna`; sin este filtro el
                // solicitante veía en el timeline que existe una nota que no puede leer.
                ->when(! $veNotasInternas, fn ($q) => $q->where(function ($q) {
                    $q->where('tipo_actividad', '!=', 'avance_registrado')
                        ->orWhere('valor_nuevo', '!=', 'nota interna');
                }))
                // Los últimos primero, que es como se pintan: el tope de bitácora
                // recorta lo viejo, no lo reciente.
                ->reciente()
                ->limit(self::LIMITE_BITACORA),
            'encuesta',
        ]);

        $avances = $this->avanceService->listarAvances($ticket, $usuario, self::LIMITE_BITACORA);

        return response()->json([
            'success' => true,
            'message' => 'Ticket obtenido correctamente.',
            'data' => array_merge($ticket->toArray(), ['avances' => $avances]),
        ], 200);
    }

    /**
     * Edición del ticket: descripción, prioridad, ubicación, activo y etiquetas.
     * La clasificación (categoría / subcategoría / título) no se edita: la fijó
     * el solicitante al abrir el ticket y el historial depende de ella.
     */
    public function update(Request $request, $id)
    {
        $ticket = $this->ticketService->buscarVisible($id, $request->user());
        $this->ticketService->autorizarGestion($ticket, $request->user());

        $data = $this->validate($request, [
            'descripcion_ticket' => 'sometimes|required|string|min:10',
            'id_prioridad_ticket' => ['sometimes', 'required', 'integer', Rule::exists(PrioridadTicket::class, 'id_prioridad_ticket')],
            'id_ubicacion' => ['nullable', 'integer', Rule::exists(Ubicacion::class, 'id_ubicacion')],
            'etiquetas' => 'nullable|array',
            'etiquetas.*' => ['integer', Rule::exists(Etiqueta::class, 'id_etiqueta')],
        ]);

        $ticket = DB::transaction(function () use ($ticket, $data, $request) {
            // Re-lectura con lock: entre el `buscarVisible` y el `save` otra
            // petición pudo cambiar la prioridad, y la actividad habría registrado
            // un valor anterior equivocado.
            $ticket = Ticket::query()->lockForUpdate()->findOrFail($ticket->id_ticket);

            $anteriorPrioridad = $ticket->prioridad?->nombre_prioridad;

            if (isset($data['descripcion_ticket'])) {
                $ticket->descripcion_ticket = $data['descripcion_ticket'];
            }

            if (isset($data['id_prioridad_ticket'])) {
                $ticket->id_prioridad_ticket = $data['id_prioridad_ticket'];
            }

            if (array_key_exists('id_ubicacion', $data)) {
                $ticket->id_ubicacion = $data['id_ubicacion'];
            }

            $ticket->save();

            if (isset($data['id_prioridad_ticket'])) {
                $this->ticketService->registrarActividad(
                    $ticket,
                    $request->user(),
                    'cambio_prioridad',
                    $anteriorPrioridad,
                    $ticket->prioridad?->nombre_prioridad
                );
            }

            if (array_key_exists('etiquetas', $data)) {
                $ticket->etiquetas()->sync($data['etiquetas'] ?? []);
            }

            return $ticket;
        });

        return response()->json([
            'success' => true,
            'message' => 'Ticket actualizado exitosamente.',
            'data' => $ticket->recargarConDetalle(),
        ], 200);
    }

    public function cambiarEstado(Request $request, $id)
    {
        $ticket = $this->ticketService->buscarVisible($id, $request->user());
        $this->ticketService->autorizarGestion($ticket, $request->user());

        $data = $this->validate($request, [
            'id_estatus_ticket' => ['required', 'integer', Rule::exists(EstatusTicket::class, 'id_estatus_ticket')],
            'comentario' => 'nullable|string|max:1000',
        ]);

        $ticket = $this->ticketService->cambiarEstado(
            $ticket,
            (int) $data['id_estatus_ticket'],
            $request->user(),
            $data['comentario'] ?? null
        );

        return response()->json([
            'success' => true,
            'message' => 'Estatus actualizado correctamente.',
            'data' => $ticket->recargarConDetalle(),
        ], 200);
    }

    /**
     * Fija quién atiende el ticket: el responsable (obligatorio) y hasta cuatro
     * colaboradores (opcionales, en orden de captura).
     *
     * Todos tienen que ser empleados activos del área que atiende la categoría —es
     * lo que mantiene la información confinada al departamento— y ninguno puede
     * repetirse. El responsable es el único que manda; los colaboradores son
     * información de apoyo (ver `TicketService::establecerTecnicos`).
     */
    public function establecerTecnicos(Request $request, $id)
    {
        $ticket = $this->ticketService->buscarVisible($id, $request->user());

        // Antes de validar: un solicitante sin relación con el ticket recibe 403 y no
        // un 422 de validación. La vía de "tomar" y la de repartir el trabajo de la
        // cola viven en `autorizarAsignacion`, al mismo nivel que gestionar el ticket
        // (`tickets.escritura` + ser del área que atiende la categoría).
        $this->ticketService->autorizarAsignacion($ticket, $request->user());

        $departamentoDelTicket = $ticket->categoria?->id_departamento_default;

        // Solo empleados activos del área: asignar a alguien dado de baja deja el
        // ticket sin nadie que lo pueda atender, y sin este recorte un técnico con
        // `escritura` podía asignar el ticket a un empleado de otra área por API.
        $reglaEmpleado = Rule::exists('tableEmpleados', 'id_empleado')->where('estatus_activo', true);

        if ($departamentoDelTicket !== null) {
            $reglaEmpleado->where('id_departamento', $departamentoDelTicket);
        }

        $data = $this->validate($request, [
            'id_responsable' => ['required', 'integer', $reglaEmpleado],
            'id_tecnico_dos' => ['nullable', 'integer', $reglaEmpleado],
            'id_tecnico_tres' => ['nullable', 'integer', $reglaEmpleado],
            'id_tecnico_cuatro' => ['nullable', 'integer', $reglaEmpleado],
            'id_tecnico_cinco' => ['nullable', 'integer', $reglaEmpleado],
        ]);

        // Nadie dos veces: ni un colaborador contra el responsable ni entre ellos. Se
        // revisa aquí y no con `different:` porque esa regla se salta los nulos, y el
        // caso normal es que los cuatro huecos vengan vacíos.
        $ids = array_values(array_filter(
            [
                $data['id_responsable'],
                $data['id_tecnico_dos'] ?? null,
                $data['id_tecnico_tres'] ?? null,
                $data['id_tecnico_cuatro'] ?? null,
                $data['id_tecnico_cinco'] ?? null,
            ],
            fn ($id) => $id !== null
        ));

        if (count($ids) !== count(array_unique($ids))) {
            throw ValidationException::withMessages([
                'id_responsable' => 'Un empleado no puede aparecer dos veces en el mismo ticket.',
            ]);
        }

        $ticket = $this->ticketService->establecerTecnicos($ticket, $data, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Técnicos actualizados correctamente.',
            'data' => $ticket->recargarConDetalle(),
        ], 200);
    }

    /**
     * Enciende o apaga la marca de "error de proveedor" y guarda sus campos.
     *
     * Es el botón de la columna Acciones de la mesa: controla si el detalle muestra
     * la sección "Errores de Proveedor". Requiere lo mismo que gestionar el ticket.
     */
    public function marcarErrorProveedor(Request $request, $id)
    {
        $ticket = $this->ticketService->buscarVisible($id, $request->user());

        $this->ticketService->autorizarGestion($ticket, $request->user());

        $data = $this->validate($request, [
            'error_proveedor' => ['required', 'boolean'],
            'id_proveedor_error' => ['nullable', 'integer', Rule::exists(ProveedorError::class, 'id_proveedor_error')],
            'id_soluciona_error' => ['nullable', 'integer', Rule::exists(ProveedorError::class, 'id_proveedor_error')],
            'id_sistema' => ['nullable', 'integer', Rule::exists(SistemaProveedor::class, 'id_sistema_proveedor')],
            'no_ticket_externo' => ['nullable', 'string', 'max:60'],
            'id_modulo_sistema' => ['nullable', 'integer', Rule::exists(ModuloSIHO::class, 'id_modulo_siho')],
            'personal_sac' => ['nullable', 'boolean'],
        ]);

        // Encender la bandera no obliga a capturar el proveedor: la mesa la enciende
        // para marcar el ticket y el detalle es donde se captura el error.
        $ticket = $this->ticketService->marcarErrorProveedor($ticket, $data, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Ticket actualizado.',
            'data' => $ticket->recargarConDetalle(),
        ], 200);
    }

    public function cerrar(Request $request, $id)
    {
        $ticket = $this->ticketService->buscarVisible($id, $request->user());
        $this->ticketService->autorizarGestion($ticket, $request->user());

        $ticket = $this->ticketService->cerrarTicket($ticket, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Ticket cerrado correctamente.',
            'data' => $ticket->recargarConDetalle(),
        ], 200);
    }

    /**
     * Reapertura. El solicitante solo puede reabrir sus propios tickets; quien
     * tiene la gestión interna del Helpdesk puede reabrir cualquiera.
     */
    public function reabrir(Request $request, $id)
    {
        $usuario = $request->user();
        $gestionaInternas = Permisos::tiene($usuario, 'helpdesk.internas', 'escritura');

        // El solicitante reabre los suyos y el administrador cualquiera; el lookup
        // acotado devuelve 404 en ambos casos ajenos.
        $ticket = $gestionaInternas
            ? Ticket::query()->where('id_ticket', $id)->firstOrFail()
            : $this->ticketService->buscarVisible($id, $usuario);

        if ((int) $ticket->id_usuario_solicitante !== (int) $usuario->id_usuario
            && ! $gestionaInternas) {
            throw new AuthorizationException('Solo el solicitante del ticket o un administrador puede reabrirlo.');
        }

        $data = $this->validate($request, [
            'motivo' => 'required|string|min:10',
        ]);

        $ticket = $this->ticketService->reabrirTicket($ticket, $data['motivo'], $usuario);

        return response()->json([
            'success' => true,
            'message' => 'Ticket reabierto correctamente.',
            'data' => $ticket->recargarConDetalle(),
        ], 200);
    }
}
