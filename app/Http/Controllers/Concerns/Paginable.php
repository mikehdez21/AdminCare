<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Trait reutilizable para búsqueda y paginación en el servidor.
 *
 * La paginación es opt-in y retrocompatible: solo se responde paginado cuando
 * el request trae el parámetro `per_page` explícito y válido (> 0 numérico).
 * Sin `per_page` (o con un valor <= 0 / no numérico) el endpoint devuelve la
 * lista completa exactamente como lo hace hoy (meta = null).
 *
 * Los params inválidos se normalizan sin generar excepciones (HTTP 500).
 */
trait Paginable
{
    /**
     * Normaliza y devuelve [page, perPage, search].
     *
     * - `page`: entero >= 1 (clamp), default 1. Valores no numéricos => 1.
     * - `per_page`: entero clamp 1..100, default $perPageDefault.
     *   El modo paginado SOLO ocurre si el request trae `per_page` explícito
     *   y numérico > 0. Si no viene, viene vacío, no numérico o <= 0 se
     *   devuelve null (lista completa, retrocompatible).
     * - `search`: trim; vacío/null equivale a sin filtro (null).
     *
     * @return array{0: int, 1: int|null, 2: string|null}
     */
    protected function paramsPaginacion(Request $request, int $perPageDefault = 10): array
    {
        // page: clamp >= 1
        $page = (int) $request->query('page', 1);
        if ($page < 1) {
            $page = 1;
        }

        // per_page: solo activa paginación si es un entero > 0 explícito
        $perPageRaw = $request->query('per_page');
        if ($perPageRaw === null || $perPageRaw === '' || ! is_numeric($perPageRaw) || (int) $perPageRaw <= 0) {
            $perPage = null;
        } else {
            $perPage = min(100, max(1, (int) $perPageRaw));
        }

        // search: trim; vacío = sin filtro (null)
        $search = trim((string) $request->query('search', ''));

        return [$page, $perPage, $search === '' ? null : $search];
    }

    /**
     * Aplica el filtro de búsqueda (WHERE OR con LOWER LIKE) sobre las columnas
     * indicadas. Usa un bloque agrupado para no afectar condiciones previas del
     * query (scopes, joins, etc.). Ignora el filtro si $search viene vacío/null.
     *
     * Para las claves primarias numéricas convierte la columna a cadena antes
     * del LIKE para poder buscar por el ID como string.
     *
     * @param  Builder|\Illuminate\Database\Query\Builder  $query
     * @param  array<int, string>  $camposBusqueda
     */
    protected function aplicarBusqueda($query, array $camposBusqueda, ?string $search): void
    {
        $search = trim((string) $search);

        if ($search === '' || $camposBusqueda === []) {
            return;
        }

        // mb_strtolower (multibyte UTF-8) para replicar el toLowerCase() de JS
        // del filtro cliente original (soporta acentos del español).
        // addcslashes escapa los wildcards de LIKE (% y _) y la barra invertida
        // para tratarlos como texto literal, igual que el String.includes() de JS.
        $termino = addcslashes(mb_strtolower($search, 'UTF-8'), '%_\\');

        $query->where(function ($q) use ($camposBusqueda, $termino) {
            foreach ($camposBusqueda as $campo) {
                $q->orWhereRaw($this->expresionBusqueda($campo).' LIKE ?', ['%'.$termino.'%']);
            }
        });
    }

    /**
     * Aplica el orden solicitado por `sort`/`direction` usando una whitelist.
     *
     * `$columnas` es un mapa clave pública => expresión SQL constante. Nunca se
     * interpola el valor que llega del cliente. Si `sort` no está en el mapa se
     * usa el orden default; si tampoco hay default, se conserva el orden que ya
     * traía la consulta.
     *
     * @param  array<string, string>  $columnas
     * @param  array{0?: string, 1?: string}  $porDefecto
     * @return array{sort: string|null, direction: string|null}
     */
    protected function aplicarOrden(Request $request, $query, array $columnas, array $porDefecto = []): array
    {
        if ($columnas === []) {
            return ['sort' => null, 'direction' => null];
        }

        $sort = trim((string) $request->query('sort', ''));
        $direction = mb_strtolower(trim((string) $request->query('direction', '')), 'UTF-8');

        if ($sort === '' || ! array_key_exists($sort, $columnas)) {
            $sort = (string) ($porDefecto[0] ?? '');
            $direction = mb_strtolower((string) ($porDefecto[1] ?? 'asc'), 'UTF-8');

            if ($sort === '' || ! array_key_exists($sort, $columnas)) {
                return ['sort' => null, 'direction' => null];
            }
        }

        if (! in_array($direction, ['asc', 'desc'], true)) {
            $direction = 'asc';
        }

        $this->ordenarPorExpresion($query, $columnas[$sort], $direction);

        return ['sort' => $sort, 'direction' => $direction];
    }

    /**
     * Aplica filtros por columna recibidos como `filtros[clave]=valor`.
     *
     * Solo se procesan las claves declaradas en `$filtros`; las demás se
     * ignoran. El valor siempre se enlaza como parámetro. El texto se escapa
     * igual que la búsqueda global para que `%` y `_` sean literales.
     *
     * @param  array<string, array{tipo?: string, expresion: string, callback?: callable}>  $filtros
     */
    protected function aplicarFiltrosColumna(Request $request, $query, array $filtros): void
    {
        $valores = $request->query('filtros');

        if (! is_array($valores) || $filtros === []) {
            return;
        }

        foreach ($filtros as $clave => $config) {
            if (! array_key_exists($clave, $valores)) {
                continue;
            }

            $valor = $valores[$clave];

            if (is_array($valor) || $valor === null) {
                continue;
            }

            $valor = trim((string) $valor);

            if ($valor === '') {
                continue;
            }

            // Evita valores desmesurados sin cambiar el comportamiento normal.
            if (mb_strlen($valor, 'UTF-8') > 255) {
                $valor = mb_substr($valor, 0, 255, 'UTF-8');
            }

            $tipo = $config['tipo'] ?? 'texto';
            $expresion = $config['expresion'];

            switch ($tipo) {
                case 'booleano':
                    $booleano = filter_var($valor, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

                    if ($booleano !== null) {
                        $query->where($expresion, $booleano);
                    }
                    break;

                case 'fecha':
                    // Valida forma y fecha real: 2026-02-31 no debe llegar al
                    // driver y provocar un 500.
                    $fecha = \DateTimeImmutable::createFromFormat('!Y-m-d', $valor);

                    if ($fecha !== false && $fecha->format('Y-m-d') === $valor) {
                        $query->whereDate($expresion, $valor);
                    }
                    break;

                case 'exacto':
                    $query->where($expresion, $valor);
                    break;

                case 'callback':
                    // Filtros que no caben en un WHERE simple (relaciones
                    // many-to-many, subconsultas). El callback es constante del
                    // backend y recibe el valor ya normalizado.
                    if (isset($config['callback']) && is_callable($config['callback'])) {
                        ($config['callback'])($query, $valor);
                    }
                    break;

                case 'texto':
                default:
                    $termino = addcslashes(mb_strtolower($valor, 'UTF-8'), '%_\\');
                    $query->whereRaw($this->expresionBusqueda($expresion).' LIKE ?', ['%'.$termino.'%']);
                    break;
            }
        }
    }

    /**
     * Ordena por una expresión SQL constante ya validada por la whitelist.
     * En PostgreSQL los nulos siempre van al final para que no dominen el
     * orden descendente.
     *
     * La config de tabla es la fuente de verdad del orden: se descarta cualquier
     * orden previo del query para que el default o el solicitado no queden como
     * criterio secundario.
     */
    protected function ordenarPorExpresion($query, string $expresion, string $direction): void
    {
        $direction = $direction === 'desc' ? 'desc' : 'asc';
        $sufijo = DB::connection()->getDriverName() === 'pgsql' ? ' NULLS LAST' : '';

        if ($query instanceof Builder) {
            $query->getQuery()->orders = null;
        } else {
            $query->orders = null;
        }

        $query->orderByRaw($expresion.' '.$direction.$sufijo);
    }

    /**
     * Devuelve ['items' => Collection, 'meta' => array|null].
     *
     * - Si el request pidió `per_page` válido (>0 numérico): pagina con
     *   `->paginate($perPage)` y devuelve meta
     *   { current_page, per_page, total, last_page, search, sort, direction }.
     * - Si no: `->get()` y meta null (lista completa, igual a hoy).
     *
     * `$tabla` es opcional y declara la whitelist de orden y filtros por
     * columna. Si es null, el comportamiento es exactamente el histórico.
     *
     * Acepta un builder Eloquent o un query builder de `DB::table()`.
     *
     * @param  Builder|\Illuminate\Database\Query\Builder  $query
     * @param  array<int, string>  $camposBusqueda
     * @param  array{orden?: array<string, string>, orden_default?: array{0?: string, 1?: string}, filtros?: array<string, array{tipo?: string, expresion: string, callback?: callable}>} | null  $tabla
     * @return array{items: Collection, meta: array<string, mixed>|null}
     */
    protected function paginar(Request $request, $query, array $camposBusqueda = [], int $perPageDefault = 10, ?array $tabla = null): array
    {
        [$page, $perPage, $search] = $this->paramsPaginacion($request, $perPageDefault);

        $this->aplicarBusqueda($query, $camposBusqueda, $search);

        $ordenAplicado = ['sort' => null, 'direction' => null];

        if ($tabla !== null) {
            if (! empty($tabla['filtros'])) {
                $this->aplicarFiltrosColumna($request, $query, $tabla['filtros']);
            }

            if (! empty($tabla['orden'])) {
                $ordenAplicado = $this->aplicarOrden(
                    $request,
                    $query,
                    $tabla['orden'],
                    $tabla['orden_default'] ?? []
                );
            }
        }

        if ($perPage !== null) {
            $items = $query->paginate($perPage, ['*'], 'page', $page);

            $paginador = $items->toArray();
            $meta = [
                'current_page' => $paginador['current_page'],
                'per_page' => $paginador['per_page'],
                'total' => $paginador['total'],
                'last_page' => $paginador['last_page'],
                'search' => $search,
                'sort' => $ordenAplicado['sort'],
                'direction' => $ordenAplicado['direction'],
            ];

            return ['items' => $items->getCollection(), 'meta' => $meta];
        }

        return ['items' => $query->get(), 'meta' => null];
    }

    /**
     * Construye la expresión SQL de búsqueda insensible a mayúsculas para una
     * columna. Convierte a cadena la columna para soportar PKs numéricas.
     *
     * Se adapta por driver porque `CAST(columna AS CHAR)` trunca a 1 carácter
     * en PostgreSQL/SQLite (CHAR = CHAR(1)); en MySQL/MariaDB devuelve la
     * cadena completa y se conserva la forma estándar del spec.
     */
    protected function expresionBusqueda(string $campo): string
    {
        $driver = DB::connection()->getDriverName();

        return match ($driver) {
            'pgsql', 'sqlite' => 'LOWER(CAST('.$campo.' AS TEXT))',
            'sqlsrv' => 'LOWER(CONVERT(NVARCHAR(255), '.$campo.'))',
            default => 'LOWER(CAST('.$campo.' AS CHAR))',
        };
    }
}
