<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Support\Permisos;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class table_PermissionsSeeder extends Seeder
{
    /**
     * Crea los permisos declarados en `config/permisos.php`.
     *
     * En la fase de rutas/middleware los permisos legacy ya no se siembran:
     * las rutas y menús usan capacidades.
     */
    public function run(): void
    {
        foreach (Permisos::recursos() as $recurso => $definicion) {
            foreach ($definicion['acciones'] as $accion) {
                Permission::firstOrCreate([
                    'name' => $recurso.'.'.$accion,
                    'guard_name' => 'web',
                ]);
            }
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
