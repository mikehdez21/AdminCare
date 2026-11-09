<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Retira los permisos legacy que quedaron de las fases de sidebar.
 *
 * La migración 017 inserta `sidebar_menu_admindashboard` para bases viejas,
 * así que en un `migrate:fresh --seed` volvía a aparecer en "Otros permisos".
 * Esta migración corre después de las migraciones SQLite existentes y antes
 * de las migraciones de Helpdesk (046+).
 *
 * Es idempotente: si no hay permisos legacy, no hace nada.
 */
return new class extends Migration
{
    public function up(): void
    {
        $tableNames = config('permission.table_names');
        $columnNames = config('permission.column_names');
        $permissionsTable = $tableNames['permissions'] ?? 'permissions';

        if (! Schema::hasTable($permissionsTable)) {
            return;
        }

        DB::transaction(function () use ($tableNames, $columnNames, $permissionsTable): void {
            $legacyIds = DB::table($permissionsTable)
                ->where(function ($query) {
                    $query->where('name', 'like', 'sidebar_%')
                        ->orWhere('name', 'like', 'almacengeneral_navbar_%')
                        ->orWhere('name', 'like', '%.control');
                })
                ->pluck('id');

            if ($legacyIds->isEmpty()) {
                return;
            }

            $permissionPivot = $columnNames['permission_pivot_key'] ?? 'permission_id';

            foreach (['role_has_permissions', 'model_has_permissions'] as $pivotName) {
                $pivotTable = $tableNames[$pivotName] ?? $pivotName;

                if (Schema::hasTable($pivotTable)) {
                    DB::table($pivotTable)
                        ->whereIn($permissionPivot, $legacyIds)
                        ->delete();
                }
            }

            DB::table($permissionsTable)
                ->whereIn('id', $legacyIds)
                ->delete();
        });

        app('cache')
            ->store(config('permission.cache.store') !== 'default' ? config('permission.cache.store') : null)
            ->forget(config('permission.cache.key'));
    }

    public function down(): void
    {
        // No se restauran permisos legacy: las rutas y menús ya usan capacidades.
    }
};
