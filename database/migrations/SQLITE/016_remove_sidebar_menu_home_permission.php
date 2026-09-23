<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Remove the retired Home permission from existing databases.
     *
     * Every delete is constrained to this exact permission name. This keeps
     * assignments for all other modules untouched while allowing foreign-key
     * cascades to be handled explicitly and consistently across drivers.
     */
    public function up(): void
    {
        $tableNames = config('permission.table_names');
        $permissionsTable = $tableNames['permissions'] ?? 'permissions';

        if (! Schema::hasTable($permissionsTable)) {
            return;
        }

        DB::transaction(function () use ($tableNames, $permissionsTable): void {
            $permissionIds = DB::table($permissionsTable)
                ->where('name', 'sidebar_menu_home')
                ->where('guard_name', 'web')
                ->pluck('id');

            if ($permissionIds->isEmpty()) {
                return;
            }

            $permissionPivot = config('permission.column_names.permission_pivot_key') ?? 'permission_id';

            foreach (['role_has_permissions', 'model_has_permissions'] as $pivotName) {
                $pivotTable = $tableNames[$pivotName] ?? $pivotName;

                if (Schema::hasTable($pivotTable)) {
                    DB::table($pivotTable)
                        ->whereIn($permissionPivot, $permissionIds)
                        ->delete();
                }
            }

            DB::table($permissionsTable)
                ->whereIn('id', $permissionIds)
                ->delete();
        });

        app('cache')
            ->store(config('permission.cache.store') !== 'default' ? config('permission.cache.store') : null)
            ->forget(config('permission.cache.key'));
    }

    public function down(): void
    {
        $permissionsTable = config('permission.table_names.permissions') ?? 'permissions';

        if (! Schema::hasTable($permissionsTable)
            || DB::table($permissionsTable)
                ->where('name', 'sidebar_menu_home')
                ->where('guard_name', 'web')
                ->exists()) {
            return;
        }

        DB::table($permissionsTable)->insert([
            'name' => 'sidebar_menu_home',
            'guard_name' => 'web',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
};
