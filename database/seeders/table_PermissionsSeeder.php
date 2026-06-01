<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class table_PermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [

            /* Sidebar */
            'sidebar_menu_home',
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
    }
}
