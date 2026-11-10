<?php

namespace App\Services\Permisos;

use App\Models\Departamento;
use App\Models\User;
use App\Support\Permisos;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Resuelve el alcance de un usuario sobre un recurso.
 *
 * `alcance(usuario, recurso)` responde "sobre qué registros", no "qué puede
 * hacer". La capacidad la decide `Permisos::tiene()`.
 *
 * Precedencia, gana el primero que exista:
 *   1. override del rol (con varios roles, el más amplio),
 *   2. atributos: `departamento` si el usuario tiene capacidad y atiende
 *      Helpdesk en al menos un departamento; `propio` en cualquier otro caso.
 *
 * `global` nunca se deriva: solo existe por override explícito del rol.
 */
class AlcanceService
{
    public const PROPIO = 'propio';

    public const DEPARTAMENTO = 'departamento';

    public const UBICACION = 'ubicacion';

    public const GLOBAL = 'global';

    /** Orden de amplitud para desempatar varios roles. */
    private const ORDEN = [self::PROPIO, self::DEPARTAMENTO, self::UBICACION, self::GLOBAL];

    /** @var array<string, string> */
    private array $memo = [];

    /** @var array<int, Collection<int, Departamento>> */
    private array $departamentosMemo = [];

    public function para(User $usuario, string $recurso): string
    {
        $llave = $usuario->getKey().'|'.$recurso;

        if (isset($this->memo[$llave])) {
            return $this->memo[$llave];
        }

        $delRol = $this->alcanceDeRoles($usuario, $recurso);

        if ($delRol !== null) {
            return $this->memo[$llave] = $delRol;
        }

        return $this->memo[$llave] = $this->derivado($usuario, $recurso);
    }

    /**
     * Departamentos que el usuario atiende en Helpdesk.
     *
     * Incluye su departamento principal y los del pivote
     * `tableInter_usuariosDepartamentos`, y exige la bandera en el usuario y en
     * cada departamento. Si el usuario no atiende Helpdesk, devuelve vacío.
     *
     * @return Collection<int, Departamento>
     */
    public function departamentosQueAtiende(User $usuario): Collection
    {
        $llave = (int) $usuario->getKey();

        if (isset($this->departamentosMemo[$llave])) {
            return $this->departamentosMemo[$llave];
        }

        if (! $usuario->atiende_helpdesk) {
            return $this->departamentosMemo[$llave] = collect();
        }

        $ids = collect([$usuario->id_departamento])
            ->merge($usuario->departamentos()->pluck('tableDepartamentos.id_departamento'))
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        return $this->departamentosMemo[$llave] = Departamento::query()
            ->whereIn('id_departamento', $ids)
            ->where('atiende_helpdesk', true)
            ->orderBy('nombre_departamento')
            ->get(['id_departamento', 'nombre_departamento']);
    }

    /**
     * Alcances explícitos por rol para el payload de autenticación.
     *
     * Solo viajan los recursos con fila de rol; el frontend asume el alcance
     * derivado para el resto y no necesita el mapa completo.
     *
     * @return array<string, string>
     */
    public function alcancesDeRoles(User $usuario): array
    {
        $idsRol = $usuario->roles()->pluck('roles.id');

        if ($idsRol->isEmpty()) {
            return [];
        }

        return DB::table('tableInter_rolesAlcances')
            ->whereIn('id_rol', $idsRol)
            ->get(['recurso', 'alcance'])
            ->groupBy('recurso')
            ->map(fn (Collection $filas) => $this->masAmplio($filas->pluck('alcance')))
            ->filter()
            ->all();
    }

    /**
     * Recorta un listado de tickets al alcance del usuario.
     *
     * Es el único lugar donde se decide el alcance de la mesa. `modulo` es
     * `tickets` (la mesa) o `reportes` (el dashboard).
     */
    public function aplicarTickets(Builder $query, User $usuario, string $modulo = 'tickets'): Builder
    {
        $recurso = 'helpdesk.'.$modulo;
        $alcance = $this->para($usuario, $recurso);

        if ($alcance === self::GLOBAL) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($usuario, $alcance) {
            $this->whereEsTicketPropio($q, $usuario);

            if ($alcance !== self::DEPARTAMENTO) {
                return;
            }

            $ids = $this->departamentosQueAtiende($usuario)->pluck('id_departamento');

            if ($ids->isNotEmpty()) {
                $q->orWhereHas(
                    'categoria',
                    fn (Builder $categoria) => $categoria->whereIn('id_departamento_default', $ids)
                );
            }
        });
    }

    /**
     * Si el ticket pertenece a una categoría de un departamento que el usuario
     * atiende.
     */
    public function atiendeLaCategoriaDelTicket(User $usuario, ?int $idDepartamentoCategoria): bool
    {
        if ($idDepartamentoCategoria === null || ! $usuario->atiende_helpdesk) {
            return false;
        }

        return $this->departamentosQueAtiende($usuario)
            ->contains(fn (Departamento $departamento) => (int) $departamento->id_departamento === $idDepartamentoCategoria);
    }

    private function alcanceDeRoles(User $usuario, string $recurso): ?string
    {
        $idsRol = $usuario->roles()->pluck('roles.id');

        if ($idsRol->isEmpty()) {
            return null;
        }

        return $this->masAmplio(
            DB::table('tableInter_rolesAlcances')
                ->whereIn('id_rol', $idsRol)
                ->where('recurso', $recurso)
                ->pluck('alcance')
        );
    }

    private function derivado(User $usuario, string $recurso): string
    {
        if (Permisos::tiene($usuario, $recurso, 'lectura')
            && $this->departamentosQueAtiende($usuario)->isNotEmpty()) {
            return self::DEPARTAMENTO;
        }

        return self::PROPIO;
    }

    /** @param Collection<int, string> $alcances */
    private function masAmplio(Collection $alcances): ?string
    {
        return $alcances
            ->sortByDesc(fn (?string $alcance) => array_search($alcance, self::ORDEN, true) ?: 0)
            ->first();
    }

    private function whereEsTicketPropio(Builder $query, User $usuario): Builder
    {
        $query->where('id_usuario_solicitante', $usuario->getKey());

        if (! empty($usuario->id_empleado)) {
            $query->orWhere('id_responsable', $usuario->id_empleado);
        }

        return $query;
    }
}
