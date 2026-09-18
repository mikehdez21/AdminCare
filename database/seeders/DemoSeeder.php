<?php

namespace Database\Seeders;

use App\Models\AlmacenGeneral\ActivosFijos;
use App\Models\AlmacenGeneral\FacturaActivos;
use App\Models\AlmacenGeneral\FacturaAF;
use App\Models\AlmacenGeneral\Proveedores;
use App\Models\Departamento;
use App\Models\Empleado;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $date = '2026-01-15 12:00:00';

        $department = Departamento::create([
            'nombre_departamento' => 'Demo Operaciones',
            'descripcion' => 'Departamento sintético para la demostración.',
            'atiende_pacientes' => false,
            'estatus_activo' => true,
            'created_at' => $date,
            'updated_at' => $date,
        ]);

        $employee = Empleado::create([
            'nombre_empleado' => 'Demo',
            'apellido_paterno' => 'Usuario',
            'apellido_materno' => 'Principal',
            'email_empleado' => 'demo.employee@example.invalid',
            'telefono_empleado' => '0000000000',
            'genero' => 'Masculino',
            'fecha_nacimiento' => '1990-01-01',
            'estatus_activo' => true,
            'fecha_alta' => $date,
            'firma_movimientos' => hash('sha256', 'admincare-demo-signature'),
            'id_departamento' => $department->getKey(),
            'created_at' => $date,
            'updated_at' => $date,
        ]);

        $role = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $demoPermissions = [
            // Sidebar parents
            'sidebar_menu_admindashboard',
            'sidebar_menu_almacenes',
            'sidebar_menu_administrador',
            'sidebar_menu_contabilidad',

            // Sidebar submenus
            'sidebar_submenu_almacenes_almacengeneral',
            'sidebar_submenu_contabilidad_depreciacionaf',
            'sidebar_submenu_contabilidad_configuracion',
            'sidebar_submenu_contabilidad_auditoria',
            'sidebar_submenu_administrador_gestionusuarios',
            'sidebar_submenu_administrador_gestionempleados',
            'sidebar_submenu_administrador_gestionroles',
            'sidebar_submenu_administrador_gestiondepartamentos',
            'sidebar_submenu_administrador_gestionubicaciones',

            // AlmacenGeneral navigation
            'almacengeneral_navbar_inicio',
            'almacengeneral_navbar_facturas',
            'almacengeneral_navbar_activos',
            'almacengeneral_navbar_movimientosactivos',
            'almacengeneral_navbar_etiquetas',
            'almacengeneral_navbar_proveedores',
            'almacengeneral_navbar_parametros',
        ];

        foreach ($demoPermissions as $name) {
            $role->givePermissionTo(Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']));
        }

        $user = User::create([
            'nombre_usuario' => 'demo_admin',
            'email_usuario' => 'demo.admin@example.invalid',
            'password' => Hash::make('DemoAdmin-2026'),
            'estatus_activo' => true,
            'usuario_compartido' => false,
            'id_empleado' => $employee->getKey(),
            'id_departamento' => $department->getKey(),
            'created_at' => $date,
            'updated_at' => $date,
        ]);
        $user->assignRole($role);

        $catalogs = [
            ['tableRef_FormasPago', 'id_formapago', 'descripcion_formaspago', 'Demo transferencia'],
            ['tableRef_ClasificacionesAF', 'id_clasificacion', 'nombre_clasificacion', 'Equipo demo'],
            ['tableRef_DescuentoProveedor', 'id_descuento_proveedor', 'descripcion_descuentoproveedor', 'Sin descuento'],
            ['tableRef_TiposProveedor', 'id_tipoproveedor', 'descripcion_tipoproveedor', 'Proveedor de bienes'],
            ['tableRef_RegimenFiscales', 'id_regimenfiscal', 'descripcion_regimenfiscal', 'Régimen demo'],
            ['tableRef_TiposFacturacion', 'id_tipofacturacion', 'descripcion_tipofacturacion', 'Factura demo'],
            ['tableRef_TiposMovimientosAF', 'id_tipomovimientoaf', 'nombre_tipomovimientoaf', 'Asignación'],
            ['tableRef_TiposFacturasAF', 'id_tipofacturaaf', 'nombre_tipofactura', 'Factura de compra demo'],
            ['tableRef_EstatusAF', 'id_estatusaf', 'descripcion_estatusaf', 'Activo'],
            ['tableRef_TiposMonedas', 'id_tipomoneda', 'descripcion_tipomoneda', 'Moneda demo'],
            ['tableRef_EstatusDepreciacionAF', 'id_estatus_depreciacion', 'descripcion_estatus_depreciacion', 'En curso'],
        ];
        $catalogIds = [];
        foreach ($catalogs as [$table, $key, $label, $value]) {
            $data = [
                $label => $value,
                'created_at' => $date,
                'updated_at' => $date,
            ];
            if ($table === 'tableRef_ClasificacionesAF') {
                $data['cuenta_contable'] = 'DEMO-1000';
            }
            $catalogIds[$table] = DB::table($table)->insertGetId($data, $key);
        }
        $catalogIds['tableRef_MetodosDepreciacion'] = DB::table('tableRef_MetodosDepreciacion')->insertGetId([
            'nombre_metodo' => 'Línea recta demo', 'descripcion_metodo' => 'Método sintético para demostración',
            'formula' => 'costo / vida útil', 'tasa_default' => 20, 'activo' => true,
            'created_at' => $date, 'updated_at' => $date,
        ], 'id_metodo_depreciacion');

        $location = DB::table('tableUbicaciones')->insertGetId([
            'nombre_ubicacion' => 'Ubicación demo', 'descripcion_ubicacion' => 'Espacio sintético de demostración',
            'estatus_activo' => true, 'created_at' => $date, 'updated_at' => $date,
        ], 'id_ubicacion');

        $supplier = Proveedores::create([
            'nombre_proveedor' => 'Proveedor Demo 01',
            'razon_social' => 'Proveedor Demo 01',
            'email_proveedor' => 'supplier@example.invalid',
            'telefono_proveedor' => '0000000000',
            'rfc' => 'DEMO000000XXX',
            'estatus_activo' => true,
            'id_tipo_moneda' => $catalogIds['tableRef_TiposMonedas'],
            'id_tipo_proveedor' => $catalogIds['tableRef_TiposProveedor'],
            'id_forma_pago' => $catalogIds['tableRef_FormasPago'],
            'id_tipo_regimen' => $catalogIds['tableRef_RegimenFiscales'],
            'id_tipo_descuento' => $catalogIds['tableRef_DescuentoProveedor'],
            'id_tipo_facturacion' => $catalogIds['tableRef_TiposFacturacion'],
            'created_at' => $date, 'updated_at' => $date,
        ]);

        $factura = FacturaAF::create([
            'id_proveedor' => $supplier->getKey(), 'num_factura' => 'DEMO-INV-001',
            'id_tipo_factura' => $catalogIds['tableRef_TiposFacturasAF'],
            'fecha_fac_recepcion' => '2026-01-15',
            'id_forma_pago' => $catalogIds['tableRef_FormasPago'],
            'id_tipo_moneda' => $catalogIds['tableRef_TiposMonedas'],
            'observaciones_factura' => 'Factura sintética de demostración', 'subtotal_factura' => 1000,
            'descuento_factura' => 0, 'flete_factura' => 0, 'iva_factura' => 160, 'total_factura' => 1160,
            'created_at' => $date, 'updated_at' => $date,
        ]);

        $assets = [];
        foreach ([['DEMO-AF-001', 'Equipo Demo A'], ['DEMO-AF-002', 'Equipo Demo B'], ['DEMO-AF-003', 'Equipo Demo sin factura']] as [$code, $name]) {
            $asset = ActivosFijos::create([
                'codigo_unico' => $code, 'codigo_etiqueta' => $code.'-LABEL', 'nombre_af' => $name,
                'descripcion_af' => 'Activo sintético de demostración', 'modelo_af' => 'Modelo Demo',
                'marca_af' => 'Marca Demo', 'numero_serie_af' => $code, 'costo_unitario_af' => 500,
                'af_propio' => true, 'af_menor' => false,
                'id_estado_af' => $catalogIds['tableRef_EstatusAF'],
                'id_clasificacion' => $catalogIds['tableRef_ClasificacionesAF'],
                'fecha_registro_af' => '2026-01-15', 'depreciacion_aplicada' => false,
                'created_at' => $date, 'updated_at' => $date,
            ]);
            $assets[] = $asset;
            if ($code !== 'DEMO-AF-003') {
                FacturaActivos::create(['id_factura' => $factura->id_factura, 'id_activo_fijo' => $asset->id_activo_fijo, 'created_at' => $date, 'updated_at' => $date]);
            }
        }

        foreach ($assets as $asset) {
            DB::table('tableAF_MovimientosActivos')->insert([
                'id_activo_fijo' => $asset->id_activo_fijo,
                'id_tipo_movimiento' => $catalogIds['tableRef_TiposMovimientosAF'],
                'motivo_movimiento' => 'Asignación inicial demo', 'fecha_movimiento' => $date,
                'id_responsable_actual' => $employee->getKey(), 'id_ubicacion_actual' => $location,
                'created_at' => $date, 'updated_at' => $date,
            ]);
        }

        DB::table('tableAF_DepreciacionActivo')->insert([
            'id_activo_fijo' => $assets[0]->id_activo_fijo,
            'id_metodo_depreciacionaf' => $catalogIds['tableRef_MetodosDepreciacion'],
            'id_estatus_depreciacion' => $catalogIds['tableRef_EstatusDepreciacionAF'],
            'anio_depreciacionaf' => 2026, 'valor_inicialaf' => 500, 'valor_depreciacion_anterior' => 0,
            'valor_depreciacion_acumulada' => 100, 'valor_depreciacion_anual' => 100, 'valor_libros_af' => 400,
            'fecha_inicio_depreciacion' => '2026-01-15', 'vida_util_anios' => 5, 'valor_residual_af' => 0,
            'fecha_calculo_depreciacion' => $date, 'id_usuario_calculo' => $user->getKey(),
            'observaciones_depreciacionaf' => 'Cálculo sintético de demostración', 'created_at' => $date, 'updated_at' => $date,
        ]);

        DB::table('demo_database_marker')->updateOrInsert(
            ['id' => 1],
            ['marker' => 'admincare-demo-v1', 'updated_at' => now()],
        );

        // QR se excluye: DEMO_MODE bloquea su persistencia y generación.
        // Se excluyen tablas técnicas (migrations, jobs, sessions, cache y tokens);
        // permisos y roles sí se cargan porque son necesarios para autorizar la demo.
    }
}
