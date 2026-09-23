<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ensure the Admin role exists and owns every permission currently present
     * in the permissions table, without rebuilding demo data.
     */
    public function up(): void
    {
        $tableNames = config('permission.table_names');
        $columnNames = config('permission.column_names');
        $permissionsTable = $tableNames['permissions'] ?? 'permissions';
        $rolesTable = $tableNames['roles'] ?? 'roles';
        $pivotTable = $tableNames['role_has_permissions'] ?? 'role_has_permissions';
        $rolePivot = $columnNames['role_pivot_key'] ?? 'role_id';
        $permissionPivot = $columnNames['permission_pivot_key'] ?? 'permission_id';

        if (! Schema::hasTable($permissionsTable)
            || ! Schema::hasTable($rolesTable)
            || ! Schema::hasTable($pivotTable)) {
            return;
        }

        DB::transaction(function () use (
            $permissionsTable,
            $rolesTable,
            $pivotTable,
            $rolePivot,
            $permissionPivot,
        ): void {
            // Create the Admin role only when it is missing; never touch other roles.
            DB::table($rolesTable)->insertOrIgnore([
                'name' => 'Admin',
                'guard_name' => 'web',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $roleId = DB::table($rolesTable)
                ->where('name', 'Admin')
                ->where('guard_name', 'web')
                ->value('id');

            if ($roleId === null) {
                return;
            }

            $permissionIds = DB::table($permissionsTable)->pluck('id');

            foreach ($permissionIds as $permissionId) {
                DB::table($pivotTable)->insertOrIgnore([
                    $permissionPivot => $permissionId,
                    $rolePivot => $roleId,
                ]);
            }
        });

        app('cache')
            ->store(config('permission.cache.store') !== 'default' ? config('permission.cache.store') : null)
            ->forget(config('permission.cache.key'));
    }

    public function down(): void
    {
        // Keep the existing assignments intact when rolling back this migration.
    }
};