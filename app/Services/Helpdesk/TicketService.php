<?php

namespace App\Services\Helpdesk;

use App\Models\Departamento;
use App\Models\Empleado;
use App\Models\Helpdesk\ActividadTicket;
use App\Models\Helpdesk\CategoriaTicket;
use App\Models\Helpdesk\EstatusTicket;
use App\Models\Helpdesk\Etiqueta;
use App\Models\Helpdesk\ProveedorError;
use App\Models\Helpdesk\SLANivel;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TicketTecnico;
use App\Models\Helpdesk\TituloTicket;
use App\Models\User;
use App\Services\Permisos\AlcanceService;
use App\Support\Permisos;
use App\Support\SchemaTable;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TicketService
{
    public function __construct(private readonly AlcanceService $alcance)
    {
    }

    /**
     * Mapa de transiciones permitidas, indexado por el nombre del estatus actual.
     * Un estatus que no aparece en el mapa no admite ninguna transición.
     */
    public const TRANSICIONES = [
        'Abierto' => ['Asignado', 'En Proceso', 'Cerrado'],
        'Asignado' => ['En Proceso', 'Pendiente', 'Abierto'],
        'En Proceso' => ['Pendiente', 'Resuelto', 'Asignado'],
        'Pendiente' => ['En Proceso', 'Resuelto'],
        'Resuelto' => ['Cerrado', 'En Proceso'],
        'Cerrado' => ['Abierto'],
    ];

    /** Estatus desde los que tiene sentido reabrir: el ticket ya llegó a una solución. */
    private const ESTATUS_REABRIBLES = ['Resuelto', 'Cerrado'];

    /**
     * Llave del bloqueo consultivo de PostgreSQL que serializa la generación de
     * folios. Sin ella dos peticiones concurrentes podrían leer el mismo
     * consecutivo y una violaría el índice único `uk_folio_ticket`.
     */
    private const FOLIO_LOCK_KEY = 90210;

    /**
     * Crea el ticket a partir de un título del catálogo.
     *
     * El solicitante elige `id_titulo_ticket` y `id_categoria_ticket`; de aquí se
     * resuelven el snapshot `titulo_ticket`, su subcategoría y el departamento
     * responsable. El folio se genera con lock pesimista dentro de la transacción.
     *
     * @param  array  $data  id_titulo_ticket, descripcion_ticket, id_categoria_ticket,
     *                       id_prioridad_ticket, id_empleado_solicitante, id_ubicacion, etiquetas
     */
    public function crearTicket(array $data, User $usuario): Ticket
    {
        $titulo = TituloTicket::with('subcategoria')
            ->find($data['id_titulo_ticket']);

        if ($titulo === null) {
            throw ValidationException::withMessages([
                'id_titulo_ticket' => 'El título seleccionado no existe.',
            ]);
        }

        $subcategoria = $titulo->subcategoria;

        if ($subcategoria === null || (int) $subcategoria->id_categoria_ticket !== (int) $data['id_categoria_ticket']) {
            throw ValidationException::withMessages([
                'id_titulo_ticket' => 'El título seleccionado no pertenece a la categoría indicada.',
            ]);
        }

        // El departamento responsable sale de la categoría, que es quien declara qué
        // área atiende. Todo se valida aquí, antes de abrir la transacción y antes
        // de consumir el consecutivo de `id_ticket`.
        $categoria = CategoriaTicket::activos()->find($data['id_categoria_ticket']);

        if ($categoria === null) {
            throw ValidationException::withMessages([
                'id_categoria_ticket' => 'La categoría seleccionada no existe o está inactiva.',
            ]);
        }

        // La categoría tiene que declarar su departamento responsable: es el área
        // que atiende, y sin él la mesa no sabe a qué cola pertenece el ticket.
        if ($categoria->id_departamento_default === null) {
            throw ValidationException::withMessages([
                'id_categoria_ticket' => 'La categoría seleccionada no tiene un departamento responsable.',
            ]);
        }

        // Las etiquetas se validan antes del INSERT, no después. `sync()` va dentro de la
        // transacción y su falla por llave foránea la revoca entera: el ticket ya
        // estaba insertado y se perdía, y `id_ticket` se gastaba igual, porque en
        // PostgreSQL las secuencias no se deshacen con el rollback.
        if (! empty($data['etiquetas'])) {
            // La resta va al revés de lo que parece: `diff` calcula "los de este
            // conjunto que no están en el otro", así que hay que restar las
            // encontradas de las pedidas. Al revés salía siempre vacío y la
            // validación no atrapaba nada.
            $encontradas = Etiqueta::whereIn('id_etiqueta', $data['etiquetas'])
                ->pluck('id_etiqueta');

            $inexistentes = collect($data['etiquetas'])->diff($encontradas)->values();

            if ($inexistentes->isNotEmpty()) {
                throw ValidationException::withMessages([
                    'etiquetas' => 'Alguna de las etiquetas seleccionadas ya no existe.',
                ]);
            }
        }

        // El empleado solicitante se resuelve antes de la transacción: la cuenta
        // normal hereda el de su usuario y la compartida elige uno de su
        // departamento, que es la misma lista que ofrece el formulario.
        $empleadoSolicitante = $this->resolverEmpleadoSolicitante($data, $usuario);

        // El departamento *del ticket* no se guarda: es el del solicitante y se
        // resuelve por `solicitante`. Aquí solo se valida que la categoría tenga
        // un área que la atienda.
        return DB::transaction(function () use ($data, $usuario, $titulo, $subcategoria, $empleadoSolicitante) {
            $sla = SLANivel::activos()
                ->where('id_prioridad_ticket', $data['id_prioridad_ticket'])
                ->first();

            if ($sla === null) {
                throw ValidationException::withMessages([
                    'id_prioridad_ticket' => 'La prioridad seleccionada no tiene un nivel de SLA activo.',
                ]);
            }

            // `forceFill`: folio, clasificación y solicitante los fija el servidor
            // y por eso no están en `$fillable`.
            $ticket = new Ticket;
            $ticket->forceFill([
                'folio_ticket' => $this->generarFolio(),
                'titulo_ticket' => $titulo->nombre_titulo_ticket,
                'descripcion_ticket' => $data['descripcion_ticket'],
                'id_categoria_ticket' => $data['id_categoria_ticket'],
                'id_subcategoria_ticket' => $subcategoria->id_subcategoria_ticket,
                'id_titulo_ticket' => $titulo->id_titulo_ticket,
                'id_prioridad_ticket' => $data['id_prioridad_ticket'],
                'id_estatus_ticket' => $this->estatusPorNombre('Abierto')->id_estatus_ticket,
                'id_usuario_solicitante' => $usuario->id_usuario,
                'id_empleado_solicitante' => $empleadoSolicitante->id_empleado,
                'id_responsable' => null,
                'id_ubicacion' => $data['id_ubicacion'] ?? null,
                'fecha_limite_respuesta' => now()->addHours($sla->tiempo_respuesta_horas),
                'fecha_limite_resolucion' => now()->addHours($sla->tiempo_resolucion_horas),
                'ticket_reapertura' => false,
            ])->save();

            if (! empty($data['etiquetas'])) {
                $ticket->etiquetas()->sync($data['etiquetas']);
            }

            $this->registrarActividad($ticket, $usuario, 'creacion', null, 'Abierto', 'Ticket creado.');

            return $ticket;
        });
    }

    /**
     * Empleado en cuyo nombre se levanta el ticket.
     *
     * La cuenta normal queda atada al empleado de su usuario; la compartida (o la
     * que no tenga empleado) debe elegir uno activo de su mismo departamento.
     * Ignorar el id que mande una cuenta normal evita que un cliente manipulado
     * abra el ticket a nombre de otra persona.
     */
    private function resolverEmpleadoSolicitante(array $data, User $usuario): Empleado
    {
        if (! $usuario->usuario_compartido && $usuario->id_empleado !== null) {
            $empleado = Empleado::find($usuario->id_empleado);

            if ($empleado === null) {
                throw ValidationException::withMessages([
                    'id_empleado_solicitante' => 'El empleado asociado a tu usuario no existe.',
                ]);
            }

            return $empleado;
        }

        $idEmpleado = $data['id_empleado_solicitante'] ?? null;

        if ($idEmpleado === null) {
            throw ValidationException::withMessages([
                'id_empleado_solicitante' => 'Debe seleccionar el empleado para el que se levanta el ticket.',
            ]);
        }

        $empleado = Empleado::query()
            ->whereKey($idEmpleado)
            ->where('estatus_activo', true)
            ->where('id_departamento', $usuario->id_departamento)
            ->first();

        if ($empleado === null) {
            throw ValidationException::withMessages([
                'id_empleado_solicitante' => 'El empleado seleccionado no existe, está inactivo o no pertenece a tu departamento.',
            ]);
        }

        return $empleado;
    }

    /**
     * Busca un ticket por id acotado a lo que el usuario puede *leer*, y devuelve 404
     * cuando no existe o cuando le está vetado.
     *
     * Un `findOrFail` sin filtro seguido de un 403 confirma que ese id existe. Con
     * este lookup la respuesta es idéntica en ambos casos.
     *
     * El corte es de lectura, no de escritura: si el usuario puede ver el ticket pero
     * no gestionarlo (el solicitante del propio ticket, o un técnico del departamento
     * que todavía no lo ha tomado), el 403 lo decide `autorizarGestion` o
     * `autorizarAsignacion` después. Así `POST .../avances` sigue respondiendo 403 al
     * solicitante, como pide `acceptance.md`, en vez de un 404 que lo haría pasar por
     * un ticket inexistente.
     */
    public function buscarVisible(int|string $id, User $usuario): Ticket
    {
        return $this->scopeVisibleA(Ticket::query(), $usuario)
            ->where('id_ticket', $id)
            ->firstOrFail();
    }

    /**
     * Recorta un listado de tickets al alcance del usuario.
     *
     * El alcance lo resuelve `AlcanceService`:
     * - `global`: todos los tickets, de cualquier área.
     * - `departamento`: los propios más los de las categorías de los
     *   departamentos que atiende.
     * - `propio`: solo los que abrió o tiene asignados.
     *
     * Va por la categoría y no por el solicitante: la tarjeta de `MesaAyuda` se
     * muestra por `categoria.id_departamento_default`, y filtrar por el
     * departamento de quien abrió el ticket dejaba la lista vacía.
     */
    public function scopeVisibleA(Builder $query, User $usuario, string $modulo = 'tickets'): Builder
    {
        return $this->alcance->aplicarTickets($query, $usuario, $modulo);
    }

    /**
     * Si el ticket pertenece a una categoría que el usuario atiende.
     *
     * Exige la bandera en el usuario y que su departamento —principal o del
     * pivote— también atienda Helpdesk.
     */
    public function atiendeLaCategoriaDelTicket(Ticket $ticket, User $usuario): bool
    {
        $idDepartamento = $ticket->categoria?->id_departamento_default;

        return $this->alcance->atiendeLaCategoriaDelTicket(
            $usuario,
            $idDepartamento !== null ? (int) $idDepartamento : null
        );
    }

    /**
     * Si el usuario atiende Helpdesk en al menos un departamento.
     *
     * La bandera del usuario y la del departamento —principal o del pivote—
     * tienen que estar activas. Es la regla que comparten las tarjetas de la
     * mesa, las subcategorías internas y el alcance derivado.
     */
    public function atiendeHelpdesk(User $usuario): bool
    {
        return $this->alcance->departamentosQueAtiende($usuario)->isNotEmpty();
    }

    /**
     * Si el usuario ve **todas las áreas** de un módulo.
     *
     * Lo decide el alcance, no el nombre del rol ni un permiso de `control`.
     * Ver todo es supervisar, no operar: gestionar un ticket ajeno sigue
     * exigiendo atenderlo o tener `helpdesk.internas`.
     *
     * @param  string  $modulo  `tickets` (la mesa) o `reportes` (el dashboard).
     */
    public function veTodasLasMesas(User $usuario, string $modulo = 'tickets'): bool
    {
        return $this->alcance->para($usuario, 'helpdesk.'.$modulo) === AlcanceService::GLOBAL;
    }

    /**
     * Autorización de `PUT helpdesk/tickets/{id}/tecnicos`.
     *
     * Basta con ser del área que atiende la categoría
     * (`atiendeLaCategoriaDelTicket`) o tener la gestión interna: un técnico
     * reparte el trabajo de su cola sin ganar visibilidad sobre otras áreas. Es
     * la misma regla que `autorizarGestion`, así que delega en ella para no
     * mantener dos listas que se separen.
     */
    public function autorizarAsignacion(Ticket $ticket, User $usuario): void
    {
        $this->autorizarGestion($ticket, $usuario);
    }

    /**
     * Autorización de las mutaciones del ciclo de vida (editar, cambiar estado,
     * cerrar). Alcanza quien atiende el ticket —es decir, quien lo tiene asignado—,
     * quien tiene la gestión interna del Helpdesk (`helpdesk.internas.escritura`)
     * y el técnico cuyo departamento atiende la categoría: si el ticket está en su
     * cola, es trabajo suyo aunque otro técnico lo tenga tomado. El permiso
     * `helpdesk.tickets.escritura` es condición para llegar a la ruta, no
     * autorización sobre un ticket concreto.
     */
    public function autorizarGestion(Ticket $ticket, User $usuario): void
    {
        if ($ticket->esAtendientePor($usuario)
            || Permisos::tiene($usuario, 'helpdesk.internas', 'escritura')
            || $this->atiendeLaCategoriaDelTicket($ticket, $usuario)) {
            return;
        }

        throw new AuthorizationException(
            'Solo quien atiende el ticket, un técnico del área que atiende su categoría o un administrador del helpdesk puede modificarlo.'
        );
    }

    /**
     * Cambia el estatus del ticket validando contra el mapa de transiciones.
     *
     * El ticket se vuelve a leer con `lockForUpdate` dentro de la transacción: leer
     * el estatus origen antes de abrirla dejaba pasar dos peticiones concurrentes
     * que ambas veían un origen válido y una termino revirtiendo a la anterior.
     */
    public function cambiarEstado(Ticket $ticket, int $nuevoEstatusId, User $usuario, ?string $comentario = null): Ticket
    {
        $destino = $this->estatusPorId($nuevoEstatusId);

        return DB::transaction(function () use ($ticket, $destino, $usuario, $comentario) {
            $bloqueado = Ticket::query()->lockForUpdate()->findOrFail($ticket->id_ticket);

            $origen = $this->nombreEstatus($bloqueado);

            if ($origen === $destino->nombre_estatus) {
                throw ValidationException::withMessages([
                    'id_estatus_ticket' => 'El ticket ya se encuentra en el estatus indicado.',
                ]);
            }

            if (! in_array($destino->nombre_estatus, self::TRANSICIONES[$origen] ?? [], true)) {
                throw ValidationException::withMessages([
                    'id_estatus_ticket' => "No se permite pasar de «{$origen}» a «{$destino->nombre_estatus}».",
                ]);
            }

            $bloqueado->id_estatus_ticket = $destino->id_estatus_ticket;

            // El ticket registra su primera respuesta cuando alguien empieza a trabajar.
            if ($destino->nombre_estatus === 'En Proceso' && $bloqueado->fecha_primer_respuesta === null) {
                $bloqueado->fecha_primer_respuesta = now();
            }

            if ($destino->nombre_estatus === 'Resuelto') {
                $bloqueado->fecha_resolucion = now();
            }

            if ($destino->nombre_estatus === 'Cerrado') {
                $bloqueado->fecha_cierre = now();
            }

            $bloqueado->save();

            $this->registrarActividad($bloqueado, $usuario, 'cambio_estado', $origen, $destino->nombre_estatus, $comentario);

            return $bloqueado;
        });
    }

    /** Huecos de colaborador de `tableInter_ticketsTecnicos`, en orden de captura. */
    private const HUECOS_COLABORADOR = [
        'id_tecnico_dos',
        'id_tecnico_tres',
        'id_tecnico_cuatro',
        'id_tecnico_cinco',
    ];

    /**
     * Fija quién atiende el ticket: el responsable y hasta cuatro colaboradores.
     *
     * Solo toca las claves presentes en `$data`, así que quien manda únicamente el
     * responsable deja a los colaboradores como estaban.
     *
     * El responsable es el único que manda: al cambiarlo, si el ticket sigue
     * "Abierto" pasa a "Asignado" (en estados posteriores se conserva el estatus) y
     * queda la actividad `asignacion_tecnico`. Los colaboradores solo dejan su
     * actividad de alta o baja; no cambian el estatus ni autorizan nada.
     *
     * La asignación es por **empleado**, no por usuario: varios usuarios pueden
     * compartir el mismo empleado (jefe y cuenta compartida de Mantenimiento).
     * Quien realiza la acción sí es `$usuario`.
     *
     * @param  array<string, int|null>  $data
     */
    public function establecerTecnicos(Ticket $ticket, array $data, User $usuario): Ticket
    {
        return DB::transaction(function () use ($ticket, $data, $usuario) {
            $ticket = Ticket::query()->lockForUpdate()->findOrFail($ticket->id_ticket);

            // La fila de técnicos nace aquí si el ticket es anterior a la tabla.
            $fila = TicketTecnico::firstOrNew(['id_ticket' => $ticket->id_ticket]);

            if (array_key_exists('id_responsable', $data)) {
                $nuevo = $data['id_responsable'] === null ? null : (int) $data['id_responsable'];

                if ($nuevo !== ($ticket->id_responsable === null ? null : (int) $ticket->id_responsable)) {
                    $this->cambiarResponsable($ticket, $nuevo, $usuario);
                }
            }

            $this->cambiarColaboradores($ticket, $fila, $data, $usuario);

            // El responsable se espeja: es el mismo valor en las dos tablas.
            $fila->id_responsable = $ticket->id_responsable;
            $fila->save();

            return $ticket;
        });
    }

    /**
     * Enciende o apaga la marca de "error de proveedor" y guarda sus campos.
     *
     * La bandera `error_proveedor` es la que filtra en la mesa y la que enciende la
     * sección "Errores de Proveedor" del detalle. Al apagarla se limpian los campos:
     * dejarlos vivos haría que un ticket normal arrastrara datos de proveedor que ya
     * no aplican.
     *
     * @param  array<string, mixed>  $data
     */
    public function marcarErrorProveedor(Ticket $ticket, array $data, User $usuario): Ticket
    {
        return DB::transaction(function () use ($ticket, $data, $usuario) {
            $ticket = Ticket::query()->lockForUpdate()->findOrFail($ticket->id_ticket);

            $activo = (bool) $data['error_proveedor'];
            $anterior = (bool) $ticket->error_proveedor;

            $ticket->error_proveedor = $activo;
            $ticket->save();

            if (! $activo) {
                // Apagarla borra su detalle: dejarlo vivo haría que un ticket normal
                // arrastrara datos de proveedor que ya no aplican.
                $ticket->errorProveedorDetalle()->delete();
            } elseif (! empty($data['id_proveedor_error'])) {
                // Encenderla desde la mesa no captura el proveedor; el detalle es
                // donde se llena el error.
                $this->guardarErrorProveedor($ticket, $data);
            }

            // Solo se anota cuando la marca cambia: editar los campos de un ticket ya
            // marcado no es un cambio de estado del ticket.
            if ($anterior !== $activo) {
                $this->registrarActividad(
                    $ticket,
                    $usuario,
                    'error_proveedor',
                    $anterior ? 'Sí' : 'No',
                    $activo ? 'Sí' : 'No',
                    $activo
                        ? 'Ticket marcado como error de proveedor.'
                        : 'Ticket desmarcado como error de proveedor.'
                );
            }

            return $ticket;
        });
    }

    /**
     * Crea o actualiza la fila de error de proveedor del ticket.
     *
     * Los campos de sistema, no. de ticket externo, módulo y personal SAC solo se
     * guardan cuando el proveedor trae `requiere_sistema` encendido: para el resto,
     * el error es nada más la relación entre el ticket y el proveedor.
     *
     * @param  array<string, mixed>  $data
     */
    private function guardarErrorProveedor(Ticket $ticket, array $data): void
    {
        $proveedor = ProveedorError::findOrFail($data['id_proveedor_error']);
        $requiereSistema = (bool) $proveedor->requiere_sistema;

        $ticket->errorProveedorDetalle()->updateOrCreate(
            ['id_ticket' => $ticket->id_ticket],
            [
                'id_proveedor_error' => $proveedor->id_proveedor_error,
                'id_soluciona_error' => $data['id_soluciona_error'] ?? null,
                'id_sistema' => $requiereSistema ? ($data['id_sistema'] ?? null) : null,
                'no_ticket_externo' => $requiereSistema ? ($data['no_ticket_externo'] ?? null) : null,
                'id_modulo_sistema' => $requiereSistema ? ($data['id_modulo_sistema'] ?? null) : null,
                'personal_sac' => $requiereSistema ? ($data['personal_sac'] ?? null) : null,
            ]
        );
    }

    /**
     * Cambia la columna que manda, `Tickets.id_responsable`. Deja la actividad y,
     * desde "Abierto", pasa el ticket a "Asignado".
     */
    private function cambiarResponsable(Ticket $ticket, ?int $idResponsable, User $usuario): void
    {
        $anterior = $ticket->tecnico
            ? trim($ticket->tecnico->nombre_empleado.' '.$ticket->tecnico->apellido_paterno)
            : null;

        $origen = $this->nombreEstatus($ticket);

        $ticket->id_responsable = $idResponsable;

        // El flujo al asignar: de Abierto se pasa a Asignado sin que el técnico
        // tenga que hacerlo a mano. El cambio manual sigue disponible.
        if ($idResponsable !== null && $origen === 'Abierto') {
            $ticket->id_estatus_ticket = $this->estatusPorNombre('Asignado')->id_estatus_ticket;
        }

        $ticket->save();

        $nuevoNombre = $idResponsable === null ? null : $this->nombreEmpleado($idResponsable);

        $this->registrarActividad(
            $ticket,
            $usuario,
            'asignacion_tecnico',
            $anterior,
            $nuevoNombre,
            $nuevoNombre === null ? 'Ticket sin responsable.' : 'Ticket asignado a '.$nuevoNombre
        );

        if ($idResponsable !== null && $origen === 'Abierto') {
            $this->registrarActividad(
                $ticket,
                $usuario,
                'cambio_estado',
                'Abierto',
                'Asignado',
                'Asignación a '.$nuevoNombre
            );
        }
    }

    /**
     * Altas y bajas de colaboradores. Cada hueco que cambia deja su actividad; nada
     * más se toca, porque los colaboradores son información de apoyo.
     *
     * @param  array<string, int|null>  $data
     */
    private function cambiarColaboradores(Ticket $ticket, TicketTecnico $fila, array $data, User $usuario): void
    {
        foreach (self::HUECOS_COLABORADOR as $hueco) {
            if (! array_key_exists($hueco, $data)) {
                continue;
            }

            $nuevo = $data[$hueco] === null ? null : (int) $data[$hueco];
            $actual = $fila->{$hueco} === null ? null : (int) $fila->{$hueco};

            if ($nuevo === $actual) {
                continue;
            }

            if ($nuevo === null) {
                $nombre = $this->nombreEmpleado((int) $actual);

                $this->registrarActividad(
                    $ticket,
                    $usuario,
                    'colaborador_retirado',
                    $nombre,
                    null,
                    'Colaborador retirado: '.$nombre
                );
            } else {
                $nombre = $this->nombreEmpleado($nuevo);

                $this->registrarActividad(
                    $ticket,
                    $usuario,
                    'colaborador_agregado',
                    null,
                    $nombre,
                    'Colaborador agregado: '.$nombre
                );
            }

            $fila->{$hueco} = $nuevo;
        }
    }

    /** Nombre y apellido paterno del empleado, para las actividades. */
    private function nombreEmpleado(int $idEmpleado): string
    {
        $empleado = Empleado::find($idEmpleado);

        return $empleado === null
            ? 'Empleado '.$idEmpleado
            : trim($empleado->nombre_empleado.' '.$empleado->apellido_paterno);
    }

    public function cerrarTicket(Ticket $ticket, User $usuario): Ticket
    {
        $cerrado = $this->estatusPorNombre('Cerrado');
        $origen = $this->nombreEstatus($ticket);

        if (! in_array('Cerrado', self::TRANSICIONES[$origen] ?? [], true)) {
            throw ValidationException::withMessages([
                'id_estatus_ticket' => "No se puede cerrar un ticket en estatus «{$origen}».",
            ]);
        }

        return $this->cambiarEstado($ticket, (int) $cerrado->id_estatus_ticket, $usuario, 'Ticket cerrado.');
    }

    /**
     * Reabre el ticket. El motivo no se guarda en Tickets: queda como actividad
     * tipo `reapertura`, que conserva el historial completo de todos los motivos
     * en lugar de solo el último.
     */
    public function reabrirTicket(Ticket $ticket, string $motivo, User $usuario): Ticket
    {
        $motivo = trim($motivo);

        if ($motivo === '') {
            throw ValidationException::withMessages([
                'motivo' => 'El motivo de la reapertura es obligatorio.',
            ]);
        }

        return DB::transaction(function () use ($ticket, $usuario, $motivo) {
            // El estatus se re-lee con lock y se valida dentro de la transacción:
            // dos reaperturas simultáneas no pueden partir del mismo origen.
            $ticket = Ticket::query()->lockForUpdate()->findOrFail($ticket->id_ticket);
            $origen = $this->nombreEstatus($ticket);

            if (! in_array($origen, self::ESTATUS_REABRIBLES, true)) {
                throw ValidationException::withMessages([
                    'id_estatus_ticket' => 'Solo se puede reabrir un ticket resuelto o cerrado.',
                ]);
            }

            $ticket->id_estatus_ticket = $this->estatusPorNombre('Abierto')->id_estatus_ticket;
            $ticket->ticket_reapertura = true;
            $ticket->fecha_reapertura = now();
            // El ciclo se reinicia: la resolución y el cierre anteriores dejan de ser válidos.
            $ticket->fecha_resolucion = null;
            $ticket->fecha_cierre = null;
            $ticket->save();

            $this->registrarActividad($ticket, $usuario, 'reapertura', $origen, 'Abierto', $motivo);

            return $ticket;
        });
    }

    /**
     * Registra un evento en el historial del ticket.
     */
    public function registrarActividad(
        Ticket $ticket,
        ?User $usuario,
        string $tipo,
        ?string $valorAnterior,
        ?string $valorNuevo,
        ?string $descripcion = null
    ): ActividadTicket {
        return ActividadTicket::create([
            'id_ticket' => $ticket->id_ticket,
            'id_usuario_actor' => $usuario?->id_usuario,
            'tipo_actividad' => $tipo,
            'valor_anterior' => $valorAnterior,
            'valor_nuevo' => $valorNuevo,
            'descripcion_actividad' => $descripcion,
        ]);
    }

    /**
     * Tope del consecutivo anual del folio. Seis dígitos, no cuatro: `folio_ticket`
     * es `varchar(20)` y el prefijo `TK-YYYY-` ocupa 8, así que caben 12. A 9999
     * folios/año el módulo se bloqueaba; a 999999 el margen es de sobra para esta
     * instalación y sigue dejando el error de "agotado" como red de seguridad.
     */
    private const FOLIO_MAXIMO = 999999;

    /**
     * Genera el folio `TK-YYYY-NNNN` del año en curso.
     *
     * El bloqueo consultivo de transacción (advisory lock en PostgreSQL) es lo que
     * serializa de verdad a los procesos concurrentes; por eso el consecutivo se
     * calcula con `MAX()` y no con `FOR UPDATE`, que además es inválido sobre una
     * consulta agregada. El máximo se compara numéricamente sobre el sufijo: ordenar
     * por texto haría que `TK-2026-10000` fuera "menor" que `TK-2026-9999` y el
     * folio volvería a 10000, chocando con el índice único `uk_folio_ticket`.
     */
    private function generarFolio(): string
    {
        $prefijo = 'TK-'.now()->year.'-';

        $tabla = SchemaTable::helpdesk('tableMA_Tickets');

        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('SELECT pg_advisory_xact_lock(?)', [self::FOLIO_LOCK_KEY]);

            $consecutivo = (int) DB::table($tabla)
                ->where('folio_ticket', 'like', $prefijo.'%')
                ->selectRaw("COALESCE(MAX(NULLIF(SUBSTRING(folio_ticket FROM '[0-9]+$'), '')::bigint), 0) + 1 AS siguiente")
                ->value('siguiente');
        } else {
            // SQLite no tiene advisory locks ni el cast/expresión regular de
            // PostgreSQL. La transacción de creación ya serializa la escritura.
            $consecutivo = (int) DB::table($tabla)
                ->where('folio_ticket', 'like', $prefijo.'%')
                ->selectRaw('COALESCE(MAX(CAST(SUBSTR(folio_ticket, 9) AS INTEGER)), 0) + 1 AS siguiente')
                ->value('siguiente');
        }

        // ponytail: `FOLIO_MAXIMO` es un tope deliberado de 6 dígitos, muy por debajo
        // de los 12 que admite el `varchar(20)`. Evita que un fallo de formato del
        // folio dispare consecutivos enormes. Subirlo es cambiar una constante.
        if ($consecutivo > self::FOLIO_MAXIMO) {
            throw ValidationException::withMessages([
                'folio_ticket' => 'Se agotó la numeración de folios del '.now()->year.'. Se requiere ampliar el consecutivo del folio.',
            ]);
        }

        return $prefijo.str_pad((string) $consecutivo, 4, '0', STR_PAD_LEFT);
    }

    private function nombreEstatus(Ticket $ticket): string
    {
        return $ticket->estatus?->nombre_estatus
            ?? $this->estatusPorId((int) $ticket->id_estatus_ticket)->nombre_estatus;
    }

    private function estatusPorId(int $id): EstatusTicket
    {
        $estatus = EstatusTicket::find($id);

        if ($estatus === null) {
            throw ValidationException::withMessages([
                'id_estatus_ticket' => 'El estatus indicado no existe.',
            ]);
        }

        return $estatus;
    }

    private function estatusPorNombre(string $nombre): EstatusTicket
    {
        $estatus = EstatusTicket::where('nombre_estatus', $nombre)->first();

        if ($estatus === null) {
            throw new \RuntimeException("El estatus «{$nombre}» no está configurado en el catálogo del helpdesk.");
        }

        return $estatus;
    }
}
