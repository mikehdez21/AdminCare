<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add the permission to the existing Admin role without rebuilding demo data.
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
            // Older demo databases were seeded before this permission existed.
            // Ensure only this permission is present, then resolve its id below.
            DB::table($permissionsTable)->insertOrIgnore([
                'name' => 'sidebar_menu_admindashboard',
                'guard_name' => 'web',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $permissionId = DB::table($permissionsTable)
                ->where('name', 'sidebar_menu_admindashboard')
                ->where('guard_name', 'web')
                ->value('id');
            $roleId = DB::table($rolesTable)
                ->where('name', 'Admin')
                ->where('guard_name', 'web')
                ->value('id');

            // Do not create or modify unrelated roles in an existing database.
            if ($permissionId === null || $roleId === null) {
                return;
            }

            DB::table($pivotTable)->insertOrIgnore([
                $permissionPivot => $permissionId,
                $rolePivot => $roleId,
            ]);
        });

        app('cache')
            ->store(config('permission.cache.store') !== 'default' ? config('permission.cache.store') : null)
            ->forget(config('permission.cache.key'));
    }

    public function down(): void
    {
        // Keep an existing assignment intact when rolling back this migration.
    }
};
