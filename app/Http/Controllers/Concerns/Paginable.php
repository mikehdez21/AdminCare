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
     * Devuelve ['items' => Collection, 'meta' => array|null].
     *
     * - Si el request pidió `per_page` válido (>0 numérico): pagina con
     *   `->paginate($perPage)` y devuelve meta
     *   { current_page, per_page, total, last_page, search }.
     * - Si no: `->get()` y meta null (lista completa, igual a hoy).
     *
     * Acepta un builder Eloquent o un query builder de `DB::table()`.
     *
     * @param  Builder|\Illuminate\Database\Query\Builder  $query
     * @param  array<int, string>  $camposBusqueda
     * @return array{items: Collection, meta: array<string, mixed>|null}
     */
    protected function paginar(Request $request, $query, array $camposBusqueda = [], int $perPageDefault = 10): array
    {
        [$page, $perPage, $search] = $this->paramsPaginacion($request, $perPageDefault);

        $this->aplicarBusqueda($query, $camposBusqueda, $search);

        if ($perPage !== null) {
            $items = $query->paginate($perPage, ['*'], 'page', $page);

            $paginador = $items->toArray();
            $meta = [
                'current_page' => $paginador['current_page'],
                'per_page' => $paginador['per_page'],
                'total' => $paginador['total'],
                'last_page' => $paginador['last_page'],
                'search' => $search,
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
