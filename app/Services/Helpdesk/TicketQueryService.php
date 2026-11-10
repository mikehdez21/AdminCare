<?php

namespace App\Services\Helpdesk;

use App\Models\Departamento;
use App\Models\Empleado;
use App\Models\Helpdesk\EstatusTicket;
use App\Models\Helpdesk\PrioridadTicket;
use App\Models\Helpdesk\ProveedorError;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TituloTicket;
use App\Models\User;
use App\Support\SchemaTable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TicketQueryService
{
    /**
     * El recorte por rol del dashboard lo aplica `TicketService::scopeVisibleA`, el
     * mismo que usa el listado. Se inyecta en vez de duplicar las reglas: si se
     * separan, el dashboard y la mesa dejan de contar lo mismo.
     */
    public function __construct(private readonly TicketService $ticketService) {}

    /**
     * Centinela del filtro "Sin asignar".
     *
     * El filtro llega por query string, así que no puede viajar un `null`: el
     * cliente lo descarta al construir la query y, si llegara vacío, `filtrar` lo
     * leería como "no filtrar" en vez de "filtrar por los que no tienen responsable".
     * Un id inventado tampoco sirve, porque `where(id_responsable, -1)` en
     * Postgres es un error de tipo. Este texto es lo único que viaja.
     */
    public const SIN_ASIGNAR = 'sin_asignar';

    /**
     * Tickets con todos los filtros de listado aplicados. Devuelve el builder
     * para que el controller lo entregue al trait `Paginable`, que resuelve la
     * paginación y el `meta` del envelope.
     *
     * Filtros admitidos: id_estatus_ticket, id_prioridad_ticket, id_categoria_ticket,
     * id_subcategoria_ticket, id_titulo_ticket, id_responsable,
     * id_usuario_solicitante, ticket_reapertura, error_proveedor,
     * id_proveedor_error, fecha_desde, fecha_hasta.
     *
     * `id_responsable` admite el centinela `SIN_ASIGNAR`, que se traduce a
     * `IS NULL`. Filtra por el responsable, no por los colaboradores: ellos son
     * información de apoyo y no cambian a quién le toca el ticket. Ya no hay filtro
     * por departamento: ese dato no es una columna del ticket y el recorte por rol
     * lo aplica `TicketService::scopeVisibleA`.
     */
    public function listarTickets(array $filtros): Builder
    {
        return $this->filtrar(Ticket::query(), $filtros)->conDetalle();
    }

    /**
     * Tickets que atiende un departamento.
     *
     * El recorte de alcance por rol no vive aquí: lo aplica
     * `TicketService::scopeVisibleA` sobre cualquiera de estos listados, para que el
     * listado y el detalle no puedan divergir.
     */
    public function ticketsPorDepto(int $departamentoId, array $filtros): Builder
    {
        return $this->filtrar(Ticket::query(), $filtros)
            ->delDepartamento($departamentoId)
            ->conDetalle();
    }

    /**
     * Métricas del dashboard: conteos por estatus, prioridad y departamento,
     * tendencia mensual de creación y cumplimiento de SLA.
     *
     * Los conteos se agregan sobre `Tickets` sin `join` y los nombres del catálogo
     * se resuelven aparte: unir las tablas de referencia obligaría a prefijar cada
     * columna con el alias de Tickets y desambiguar `created_at` en cada orden.
     *
     * El alcance lo aplica `scopeVisibleA`, el mismo que recorta el listado: ver
     * todas las mesas es del administrador, y una jefatura solo mira la suya
     * (CORR-031). Sin usuario se falla cerrado.
     */
    public function dashboardMetrics(array $filtros, ?User $usuario = null): array
    {
        $base = $this->filtrar(Ticket::query(), $filtros, ordenar: false);

        $base = $usuario === null
            ? $base->whereRaw('1 = 0')
            : $this->ticketService->scopeVisibleA($base, $usuario, 'reportes');

        $porEstatus = $base->clone()
            ->selectRaw('id_estatus_ticket, COUNT(*) AS total')
            ->groupBy('id_estatus_ticket')
            ->pluck('total', 'id_estatus_ticket');

        $porPrioridad = $base->clone()
            ->selectRaw('id_prioridad_ticket, COUNT(*) AS total')
            ->groupBy('id_prioridad_ticket')
            ->pluck('total', 'id_prioridad_ticket');

        /**
         * Tickets por el departamento de quien los abrió.
         *
         * Es el único conteo que necesita `join`, porque el departamento ya no es
         * una columna de Tickets: vive en el usuario solicitante. Va sobre un
         * `clone` y solo selecciona columnas explícitas, así que no ambigüa
         * `created_at` ni afecta a los demás conteos, que siguen sin join.
         */
        $porDepartamento = $base->clone()
            ->join('tableUsuarios as u', 'u.id_usuario', '=', 'id_usuario_solicitante')
            ->join('tableDepartamentos as d', 'd.id_departamento', '=', 'u.id_departamento')
            ->selectRaw('d.id_departamento, COUNT(*) AS total')
            ->groupBy('d.id_departamento')
            ->pluck('total', 'd.id_departamento');

        // Solicitantes: quién abrió cada ticket. Sin `join`, como el responsable: la
        // clave ya vive en la tabla de tickets y el nombre se resuelve aparte.
        $porSolicitante = (clone $base)
            ->selectRaw('id_usuario_solicitante, COUNT(*) AS total')
            ->groupBy('id_usuario_solicitante')
            ->pluck('total', 'id_usuario_solicitante');

        $totalTickets = (clone $base)->count();
        $reabiertos = (clone $base)->where('ticket_reapertura', true)->count();

        // Títulos y responsables salen de la propia tabla de tickets, sin `join`.
        $porTitulo = (clone $base)
            ->selectRaw('id_titulo_ticket, COUNT(*) AS total')
            ->groupBy('id_titulo_ticket')
            ->pluck('total', 'id_titulo_ticket');

        // `COALESCE` para que los tickets sin responsable caigan en una sola fila con
        // clave 0 en vez de perderse en un `null` que no se puede indexar.
        $porResponsable = (clone $base)
            ->selectRaw('COALESCE(id_responsable, 0) AS id_responsable, COUNT(*) AS total')
            ->groupByRaw('COALESCE(id_responsable, 0)')
            ->pluck('total', 'id_responsable');

        /**
         * Tickets por proveedor del error.
         *
         * Va contra la tabla de errores y no con un `join` sobre la base: unirla
         * dejaría `created_at` ambiguo en el filtro de fechas. El `whereIn` con la
         * subconsulta mantiene el recorte que ya traían los filtros.
         */
        $porErrorProveedor = DB::table(SchemaTable::helpdesk('tableMA_ErroresProveedor'))
            ->whereIn('id_ticket', (clone $base)->select('id_ticket'))
            ->selectRaw('id_proveedor_error, COUNT(*) AS total')
            ->groupBy('id_proveedor_error')
            ->pluck('total', 'id_proveedor_error');

        $nombresResponsable = Empleado::whereIn('id_empleado', $porResponsable->keys()->filter())
            ->get(['id_empleado', 'nombre_empleado', 'apellido_paterno'])
            ->mapWithKeys(fn ($e) => [
                (int) $e->id_empleado => trim($e->nombre_empleado.' '.$e->apellido_paterno),
            ])
            ->all();

        // El 0 es el hueco de `COALESCE`: los tickets sin responsable.
        $nombresResponsable[0] = 'Sin asignar';

        // El solicitante se nombra como en la mesa de ayuda: por su usuario.
        $nombresSolicitante = User::whereIn('id_usuario', $porSolicitante->keys()->filter())
            ->pluck('nombre_usuario', 'id_usuario')
            ->all();

        $expresionMes = match (DB::connection()->getDriverName()) {
            'pgsql' => "TO_CHAR(created_at, 'YYYY-MM')",
            'sqlite' => "strftime('%Y-%m', created_at)",
            default => "DATE_FORMAT(created_at, '%Y-%m')",
        };

        $tendenciaMensual = (clone $base)
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->selectRaw($expresionMes.' AS mes, COUNT(*) AS total')
            ->groupByRaw($expresionMes)
            ->orderBy('mes')
            ->pluck('total', 'mes')
            ->map(fn ($total) => (int) $total)
            ->all();

        // El SLA se mide sobre los tickets que ya tienen fecha de resolución:
        // se cumplirá si se resolvieron dentro del límite calculado al crearlos.
        $conResolucion = (clone $base)->whereNotNull('fecha_resolucion')->whereNotNull('fecha_limite_resolucion');
        $totalMedibles = (clone $conResolucion)->count();
        $cumplidos = (clone $conResolucion)
            ->whereColumn('fecha_resolucion', '<=', 'fecha_limite_resolucion')
            ->count();

        return [
            'total_tickets' => $totalTickets,
            'tickets_reabiertos' => $reabiertos,
            'por_estatus' => $this->contarCatalogos(EstatusTicket::orderBy('orden_flujo')->get(), $porEstatus, 'id_estatus_ticket', 'nombre_estatus', 'color'),
            'por_prioridad' => $this->contarCatalogos(PrioridadTicket::orderBy('nivel_prioridad')->get(), $porPrioridad, 'id_prioridad_ticket', 'nombre_prioridad', 'color'),
            'por_departamento' => $this->contarCatalogos(Departamento::orderBy('nombre_departamento')->get(), $porDepartamento, 'id_departamento', 'nombre_departamento'),
            // Los solicitantes se acotan a los diez con más tickets, como los títulos: la
            // plantilla entera puede pasar por la mesa y con todos el gráfico no se lee.
            'por_solicitante' => $this->listarConteos(
                $nombresSolicitante,
                $porSolicitante,
                'id_usuario_solicitante',
                'nombre_solicitante',
                10
            ),
            // Los títulos se acotan a los diez con más tickets: el catálogo tiene 48 y
            // pintarlos todos deja el gráfico ilegible.
            'por_titulo' => $this->listarConteos(
                TituloTicket::pluck('nombre_titulo_ticket', 'id_titulo_ticket')->all(),
                $porTitulo,
                'id_titulo_ticket',
                'nombre_titulo_ticket',
                10
            ),
            'por_responsable' => $this->listarConteos(
                $nombresResponsable,
                $porResponsable,
                'id_responsable',
                'nombre_responsable'
            ),
            'por_error_proveedor' => $this->listarConteos(
                ProveedorError::pluck('nombre_proveedor_error', 'id_proveedor_error')->all(),
                $porErrorProveedor,
                'id_proveedor_error',
                'nombre_proveedor_error'
            ),
            'tendencia_mensual' => $tendenciaMensual,
            'sla' => [
                'total_medibles' => $totalMedibles,
                'cumplidos' => $cumplidos,
                'porcentaje_cumplimiento' => $totalMedibles > 0
                    ? round($cumplidos * 100 / $totalMedibles, 2)
                    : null,
            ],
        ];
    }

    /**
     * Arma un listado de conteos resolviendo el nombre contra un mapa `id => nombre`.
     *
     * A diferencia de `contarCatalogos`, solo lista lo que tiene tickets: sirve para
     * los catálogos largos (títulos) y para los que no son de referencia (el
     * responsable sale de la tabla de empleados).
     *
     * @param  array<int, string>  $nombres  Mapa `id => nombre`.
     */
    private function listarConteos(array $nombres, Collection $conteos, string $clave, string $nombre, ?int $limite = null): array
    {
        $filas = $conteos
            ->map(fn ($total, $id) => [
                $clave => (int) $id,
                $nombre => $nombres[(int) $id] ?? 'Desconocido',
                'total' => (int) $total,
            ])
            ->sortByDesc('total')
            ->values();

        return ($limite === null ? $filas : $filas->take($limite))->all();
    }

    /**
     * Cruza los conteos de Tickets con el catálogo correspondiente. Se listan
     * todos los elementos del catálogo, incluidos los que están en cero, para que
     * el dashboard no oculte un estatus o prioridad sin tickets.
     */
    private function contarCatalogos(Collection $catalogo, Collection $conteos, string $clave, string $nombre, ?string $color = null): array
    {
        return $catalogo
            ->map(fn ($item) => array_filter([
                $clave => (int) $item->{$clave},
                $nombre => $item->{$nombre},
                $color => $color === null ? null : $item->{$color},
                'total' => (int) ($conteos[$item->{$clave}] ?? 0),
            ], fn ($valor) => $valor !== null))
            ->values()
            ->all();
    }

    /**
     * Aplica los filtros de listado. Solo mira claves presentes en el request,
     * de modo que un parámetro ausente no restringe el resultado.
     */
    private function filtrar(Builder $query, array $filtros, bool $ordenar = true): Builder
    {
        foreach (
            [
                'id_estatus_ticket',
                'id_prioridad_ticket',
                'id_categoria_ticket',
                'id_subcategoria_ticket',
                'id_titulo_ticket',
                'id_responsable',
                'id_usuario_solicitante',
            ] as $columna
        ) {
            if (isset($filtros[$columna]) && $filtros[$columna] !== '') {
                // "Sin asignar": el filtro pidió explícitamente los que no tienen
                // esa columna, que es distinto de no filtrar.
                if ($filtros[$columna] === self::SIN_ASIGNAR) {
                    $query->whereNull($columna);

                    continue;
                }

                $query->where($columna, $filtros[$columna]);
            }
        }

        // `ticket_reapertura` y `error_proveedor` son banderas: viajan como 1/0 o
        // true/false, así que se resuelven aparte del bucle, que compara igualdad
        // exacta contra el valor de la columna.
        if (isset($filtros['ticket_reapertura']) && $filtros['ticket_reapertura'] !== '') {
            $query->where('ticket_reapertura', filter_var($filtros['ticket_reapertura'], FILTER_VALIDATE_BOOLEAN));
        }

        if (isset($filtros['error_proveedor']) && $filtros['error_proveedor'] !== '' && $filtros['error_proveedor'] !== null) {
            $query->where('error_proveedor', filter_var($filtros['error_proveedor'], FILTER_VALIDATE_BOOLEAN));
        }

        // El proveedor del error vive en `tableMA_ErroresProveedor` (1:1), no en el
        // ticket: se resuelve con el `exists` de la relación en vez de unir la tabla,
        // que dejaría `created_at` ambiguo en el filtro de fechas.
        if (! empty($filtros['id_proveedor_error'])) {
            $query->whereHas('errorProveedorDetalle', fn ($q) => $q->where('id_proveedor_error', $filtros['id_proveedor_error']));
        }

        if (! empty($filtros['fecha_desde'])) {
            $query->whereDate('created_at', '>=', $filtros['fecha_desde']);
        }

        if (! empty($filtros['fecha_hasta'])) {
            $query->whereDate('created_at', '<=', $filtros['fecha_hasta']);
        }

        if (! $ordenar) {
            return $query;
        }

        return $query->orderByDesc('created_at')->orderByDesc('id_ticket');
    }
}
