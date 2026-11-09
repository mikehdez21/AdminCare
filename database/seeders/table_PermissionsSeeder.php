<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Support\Permisos;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class table_PermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [

            /* Sidebar */
            'sidebar_menu_helpdesk',
            'sidebar_menu_admindashboard',
            'sidebar_menu_almacenes',
            'sidebar_menu_contabilidad',
            'sidebar_menu_administrador',

            /* Sidebar - Submenu Almacenes */
            'sidebar_submenu_almacenes_almacengeneral',

            /* Sidebar - Submenu Contabilidad */
            'sidebar_submenu_contabilidad_depreciacionaf',
            'sidebar_submenu_contabilidad_configuracion',
            'sidebar_submenu_contabilidad_auditoria',

            /* Sidebar - Submenu Administrador */
            'sidebar_submenu_administrador_gestionusuarios',
            'sidebar_submenu_administrador_gestionempleados',
            'sidebar_submenu_administrador_gestionroles',
            'sidebar_submenu_administrador_gestiondepartamentos',
            'sidebar_submenu_administrador_gestionubicaciones',

            /* AlmacenGeneral */
            'almacengeneral_navbar_inicio',
            'almacengeneral_navbar_facturas',
            'almacengeneral_navbar_activos',
            'almacengeneral_navbar_movimientosactivos',
            'almacengeneral_navbar_etiquetas',
            'almacengeneral_navbar_proveedores',
            'almacengeneral_navbar_parametros',

        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate([
                'name' => $permissionName,
                'guard_name' => 'web',
            ]);
        }

        // Permisos por acción: <modulo>.lectura, <modulo>.escritura, <modulo>.control
        // para cada uno de los módulos base (convención usada por el frontend en
        // permissions.ts y TablaPermisosRol.tsx).
        $actions = ['lectura', 'escritura', 'control'];

        foreach ($permissions as $moduleName) {
            foreach ($actions as $action) {
                Permission::firstOrCreate([
                    'name' => $moduleName . '.' . $action,
                    'guard_name' => 'web',
                ]);
            }
        }

        // Catálogo nuevo por capacidad. Convive con los permisos legacy hasta
        // que las rutas y menús se cambien en la fase de rutas/middleware.
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
