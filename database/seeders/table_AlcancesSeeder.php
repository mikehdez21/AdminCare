<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

/**
 * Alcances explícitos de la demo.
 *
 * `global` nunca se deriva: si el rol debe ver todas las áreas, necesita su
 * fila en `tableInter_rolesAlcances`.
 */
class table_AlcancesSeeder extends Seeder
{
    public function run(): void
    {
        $recursos = ['helpdesk.tickets', 'helpdesk.reportes'];
        $roles = Role::query()
            ->whereIn('name', ['Admin'])
            ->where('guard_name', 'web')
            ->pluck('id', 'name');

        $filas = [];

        foreach ($roles as $idRol) {
            foreach ($recursos as $recurso) {
                $filas[] = [
                    'id_rol' => $idRol,
                    'recurso' => $recurso,
                    'alcance' => 'global',
                ];
            }
        }

        if ($filas !== []) {
            DB::table('tableInter_rolesAlcances')->insertOrIgnore($filas);
        }
    }
}
