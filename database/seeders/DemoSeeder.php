<?php

namespace Database\Seeders;

use App\Models\AlmacenGeneral\ActivosFijos;
use App\Models\AlmacenGeneral\FacturaActivos;
use App\Models\AlmacenGeneral\FacturaAF;
use App\Models\AlmacenGeneral\MovimientosActivos;
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
            'nombre_departamento' => 'Operaciones',
            'descripcion' => 'Departamento sintético para la demostración.',
            'atiende_pacientes' => false,
            'estatus_activo' => true,
            'created_at' => $date,
            'updated_at' => $date,
        ]);

        $department2 = Departamento::create([
            'nombre_departamento' => 'Administración',
            'descripcion' => 'Departamento sintético para la demostración.',
            'atiende_pacientes' => false,
            'estatus_activo' => true,
            'created_at' => $date,
            'updated_at' => $date,
        ]);

        $employee = Empleado::create([
            'nombre_empleado' => 'Mike',
            'apellido_paterno' => 'Hernandez',
            'apellido_materno' => 'DEMO',
            'genero' => 'Masculino',
            'fecha_nacimiento' => '1990-01-01',
            'estatus_activo' => true,
            'fecha_alta' => $date,
            'id_departamento' => $department->getKey(),
            'created_at' => $date,
            'updated_at' => $date,
        ]);

        $role = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $this->call(table_PermissionsSeeder::class);
        $role->syncPermissions(Permission::all());

        $user = User::create([
            'nombre_usuario' => 'DEMOADMIN',
            'email_usuario' => 'demo.admin@example.invalid',
            'password' => Hash::make('demoadmin'),
            'estatus_activo' => true,
            'usuario_compartido' => false,
            'id_empleado' => $employee->getKey(),
            'id_departamento' => $department->getKey(),
            'created_at' => $date,
            'updated_at' => $date,
        ]);
        $user->assignRole($role);

        $catalogs = [
            ['tableRef_FormasPago', 'id_formapago', 'descripcion_formaspago', 'Transferencia'],
            ['tableRef_FormasPago', 'id_formapago', 'descripcion_formaspago', 'Efectivo'],
            ['tableRef_ClasificacionesAF', 'id_clasificacion', 'nombre_clasificacion', 'AF Equipo Demo'],
            ['tableRef_DescuentoProveedor', 'id_descuento_proveedor', 'descripcion_descuentoproveedor', 'Sin descuento'],
            ['tableRef_TiposProveedor', 'id_tipoproveedor', 'descripcion_tipoproveedor', 'Productos y Servicios'],
            ['tableRef_TiposProveedor', 'id_tipoproveedor', 'descripcion_tipoproveedor', 'Servicios'],
            ['tableRef_RegimenFiscales', 'id_regimenfiscal', 'descripcion_regimenfiscal', 'Fisica'],
            ['tableRef_TiposFacturacion', 'id_tipofacturacion', 'descripcion_tipofacturacion', 'Factura demo'],
            ['tableRef_TiposMovimientosAF', 'id_tipomovimientoaf', 'nombre_tipomovimientoaf', 'Asignación'],
            ['tableRef_TiposFacturasAF', 'id_tipofacturaaf', 'nombre_tipofactura', 'Gravada'],
            ['tableRef_TiposFacturasAF', 'id_tipofacturaaf', 'nombre_tipofactura', 'Exenta'],
            ['tableRef_EstatusAF', 'id_estatusaf', 'descripcion_estatusaf', 'Activo'],
            ['tableRef_EstatusAF', 'id_estatusaf', 'descripcion_estatusaf', 'Dado de Baja'],
            ['tableRef_EstatusAF', 'id_estatusaf', 'descripcion_estatusaf', 'En Mantenimiento'],
            ['tableRef_EstatusAF', 'id_estatusaf', 'descripcion_estatusaf', 'Perdido'],
            ['tableRef_TiposMonedas', 'id_tipomoneda', 'descripcion_tipomoneda', 'Peso Mexicano (MXN)'],
            ['tableRef_TiposMonedas', 'id_tipomoneda', 'descripcion_tipomoneda', 'Dólar Americano (USD)'],
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
                $data['cuenta_contable'] = '100.000.000.000';
            }
            $catalogIds[$table][$value] = DB::table($table)->insertGetId($data, $key);
        }
        $catalogIds['tableRef_MetodosDepreciacion'] = DB::table('tableRef_MetodosDepreciacion')->insertGetId([
            'nombre_metodo' => 'Línea recta demo', 'descripcion_metodo' => 'Método sintético para demostración',
            'formula' => 'costo / vida útil', 'tasa_default' => 20, 'activo' => true,
            'created_at' => $date, 'updated_at' => $date,
        ], 'id_metodo_depreciacion');

        $warehouseLocation = DB::table('tableUbicaciones')->insertGetId([
            'nombre_ubicacion' => 'Almacen', 'descripcion_ubicacion' => 'Ubicacion Demo',
            'estatus_activo' => true, 'created_at' => $date, 'updated_at' => $date,
        ], 'id_ubicacion');

        $receptionLocation = DB::table('tableUbicaciones')->insertGetId([
            'nombre_ubicacion' => 'Recepcion', 'descripcion_ubicacion' => 'Ubicacion Demo',
            'estatus_activo' => true, 'created_at' => $date, 'updated_at' => $date,
        ], 'id_ubicacion');

        $supplier = Proveedores::create([
            'nombre_proveedor' => 'Proveedor01',
            'razon_social' => 'PRDEMO01',
            'email_proveedor' => 'supplier@example.demo',
            'telefono_proveedor' => '0000000000',
            'rfc' => 'DEMO000000XXX',
            'estatus_activo' => true,
            'id_tipo_moneda' => $catalogIds['tableRef_TiposMonedas']['Peso Mexicano (MXN)'],
            'id_tipo_proveedor' => $catalogIds['tableRef_TiposProveedor']['Productos y Servicios'],
            'id_forma_pago' => $catalogIds['tableRef_FormasPago']['Transferencia'],
            'id_tipo_regimen' => $catalogIds['tableRef_RegimenFiscales']['Fisica'],
            'id_tipo_descuento' => $catalogIds['tableRef_DescuentoProveedor']['Sin descuento'],
            'id_tipo_facturacion' => $catalogIds['tableRef_TiposFacturacion']['Factura demo'],
            'created_at' => $date, 'updated_at' => $date,
        ]);

        $factura = FacturaAF::create([
            'id_proveedor' => $supplier->getKey(), 'num_factura' => 'NOF-2026-0001',
            'id_tipo_factura' => $catalogIds['tableRef_TiposFacturasAF']['Gravada'],
            'fecha_fac_recepcion' => '2026-01-15',
            'id_forma_pago' => $catalogIds['tableRef_FormasPago']['Transferencia'],
            'id_tipo_moneda' => $catalogIds['tableRef_TiposMonedas']['Peso Mexicano (MXN)'],
            'observaciones_factura' => 'Factura demo de equipo de oficina y cómputo.',
            'subtotal_factura' => 39000, 'descuento_factura' => 0, 'flete_factura' => 0,
            'iva_factura' => 6240, 'total_factura' => 45240,
            'created_at' => $date, 'updated_at' => $date,
        ]);

        $assetDefinitions = [
            ['nombre_af' => 'Laptop', 'marca_af' => 'Asus', 'modelo_af' => 'Vivobook 15', 'numero_serie_af' => 'ASUS-VB15-0001', 'costo_unitario_af' => 12000, 'cantidad' => 2, 'ubicacion' => $warehouseLocation],
            ['nombre_af' => 'Televisión', 'marca_af' => 'Samsung', 'modelo_af' => 'CU7000 50 pulgadas', 'numero_serie_af' => 'SAMSUNG-CU7-0001', 'costo_unitario_af' => 8500, 'cantidad' => 1, 'ubicacion' => $receptionLocation],
            ['nombre_af' => 'Escritorio de oficina', 'marca_af' => 'Genérico', 'modelo_af' => 'Escritorio modular 160 cm', 'numero_serie_af' => 'MOB-ESC-0001', 'costo_unitario_af' => 6500, 'cantidad' => 1, 'ubicacion' => $warehouseLocation],
        ];
        $assets = [];
        $linea = 1;
        foreach ($assetDefinitions as $definition) {
            $totalLote = $definition['cantidad'];
            for ($consecutivo = 1; $consecutivo <= $totalLote; $consecutivo++) {
                $resultado = ActivosFijos::crearConQR([
                    'nombre_af' => $definition['nombre_af'], 'marca_af' => $definition['marca_af'],
                    'modelo_af' => $definition['modelo_af'],
                    'numero_serie_af' => $definition['numero_serie_af'].'-'.$consecutivo,
                    'costo_unitario_af' => $definition['costo_unitario_af'], 'af_propio' => true, 'af_menor' => false,
                    'id_estado_af' => $catalogIds['tableRef_EstatusAF']['Activo'],
                    'id_clasificacion' => $catalogIds['tableRef_ClasificacionesAF']['AF Equipo Demo'],
                    'fecha_registro_af' => '2026-01-15', 'depreciacion_aplicada' => false,
                    'descripcion_af' => 'Activo demo genérico para mostrar el flujo de almacén.',
                    'codigo_lote' => 'LT'.$linea.'-F'.$factura->id_factura,
                    'lote_afconsecutivo' => $consecutivo, 'lote_total' => $totalLote,
                    'created_at' => $date, 'updated_at' => $date,
                ], false);
                $asset = $resultado['data'];
                $asset->codigo_etiqueta = sprintf('%s-F%d-L%d-C%d-LT%d', $asset->codigo_unico, $factura->id_factura, $linea, $consecutivo, $totalLote);
                $asset->save();
                FacturaActivos::create(['id_factura' => $factura->id_factura, 'id_activo_fijo' => $asset->id_activo_fijo, 'created_at' => $date, 'updated_at' => $date]);
                MovimientosActivos::create([
                    'id_activo_fijo' => $asset->id_activo_fijo, 'id_tipo_movimiento' => $catalogIds['tableRef_TiposMovimientosAF']['Asignación'],
                    'motivo_movimiento' => 'Recepción inicial de factura '.$factura->num_factura, 'fecha_movimiento' => $date,
                    'id_responsable_actual' => $employee->getKey(), 'id_ubicacion_actual' => $definition['ubicacion'],
                    'created_at' => $date, 'updated_at' => $date,
                ]);
                $assets[] = $asset;
            }
            $linea++;
        }

        $unbilledResult = ActivosFijos::crearQRSinFactura([
            'nombre_af' => 'Proyector', 'marca_af' => 'Epson', 'modelo_af' => 'PowerLite E20',
            'numero_serie_af' => 'EPSON-E20-0001', 'costo_unitario_af' => 7200, 'af_propio' => true, 'af_menor' => false,
            'id_estado_af' => $catalogIds['tableRef_EstatusAF']['Activo'],
            'id_clasificacion' => $catalogIds['tableRef_ClasificacionesAF']['AF Equipo Demo'],
            'fecha_registro_af' => '2026-01-15', 'depreciacion_aplicada' => false,
            'descripcion_af' => 'Activo demo recibido sin factura asociada.', 'created_at' => $date, 'updated_at' => $date,
        ], false);
        $unbilledAsset = $unbilledResult['data'];
        $assets[] = $unbilledAsset;
        MovimientosActivos::create([
            'id_activo_fijo' => $unbilledAsset->id_activo_fijo, 'id_tipo_movimiento' => $catalogIds['tableRef_TiposMovimientosAF']['Asignación'],
            'motivo_movimiento' => 'Registro inicial sin factura', 'fecha_movimiento' => $date,
            'id_responsable_actual' => $employee->getKey(), 'id_ubicacion_actual' => $receptionLocation,
            'created_at' => $date, 'updated_at' => $date,
        ]);

        DB::table('tableAF_DepreciacionActivo')->insert([
            'id_activo_fijo' => $assets[0]->id_activo_fijo,
            'id_metodo_depreciacionaf' => $catalogIds['tableRef_MetodosDepreciacion'],
            'id_estatus_depreciacion' => $catalogIds['tableRef_EstatusDepreciacionAF']['En curso'],
            'anio_depreciacionaf' => 2026, 'valor_inicialaf' => 12000, 'valor_depreciacion_anterior' => 0,
            'valor_depreciacion_acumulada' => 2400, 'valor_depreciacion_anual' => 2400, 'valor_libros_af' => 9600,
            'fecha_inicio_depreciacion' => '2026-01-15', 'vida_util_anios' => 5, 'valor_residual_af' => 0,
            'fecha_calculo_depreciacion' => $date, 'id_usuario_calculo' => $user->getKey(),
            'observaciones_depreciacionaf' => 'Cálculo sintético de demostración', 'created_at' => $date, 'updated_at' => $date,
        ]);

        // ============================================================
        // Empleado y usuario demo de Almacén (solo permisos de almacén)
        // ============================================================

        $warehouseDepartment = Departamento::firstOrCreate(
            ['nombre_departamento' => 'Almacén'],
            [
                'descripcion' => 'Encargado del control de inventario y suministros',
                'atiende_pacientes' => false,
                'estatus_activo' => true,
                'created_at' => $date,
                'updated_at' => $date,
            ]
        );

        $warehouseEmployee = Empleado::firstOrCreate(
            [
                'nombre_empleado' => 'Almacen',
                'apellido_paterno' => 'AlmacenDemo',
                'apellido_materno' => 'DEMO',
            ],
            [
                'genero' => 'Masculino',
                'fecha_nacimiento' => '1990-01-01',
                'estatus_activo' => true,
                'fecha_alta' => $date,
                // foto_empleado no se setea (null): el frontend usa el default real.
                'id_departamento' => $warehouseDepartment->getKey(),
                'created_at' => $date,
                'updated_at' => $date,
            ]
        );

        $warehouseRole = Role::firstOrCreate(['name' => 'Almacen', 'guard_name' => 'web']);

        // Permisos asignados: base de cada módulo de Almacén + variantes de acción
        // (<modulo>.lectura|escritura|control), convención de table_PermissionsSeeder.
        $almacenModules = [
            'sidebar_menu_almacenes',
            'sidebar_submenu_almacenes_almacengeneral',
            'almacengeneral_navbar_inicio',
            'almacengeneral_navbar_facturas',
            'almacengeneral_navbar_activos',
            'almacengeneral_navbar_movimientosactivos',
            'almacengeneral_navbar_etiquetas',
            'almacengeneral_navbar_proveedores',
            'almacengeneral_navbar_parametros',
        ];

        $warehouseRole->syncPermissions(collect($almacenModules)->flatMap(function (string $module): array {
            return [$module, $module.'.lectura', $module.'.escritura', $module.'.control'];
        })->all());

        $warehouseUser = User::firstOrCreate(
            ['nombre_usuario' => 'DEMOALMACEN'],
            [
                'email_usuario' => 'demo.almacen@example.invalid',
                'password' => Hash::make('demoalmacen'),
                'estatus_activo' => true,
                'usuario_compartido' => false,
                'id_empleado' => $warehouseEmployee->getKey(),
                'id_departamento' => $warehouseDepartment->getKey(),
                'created_at' => $date,
                'updated_at' => $date,
            ]
        );
        $warehouseUser->assignRole($warehouseRole);

        DB::table('demo_database_marker')->updateOrInsert(
            ['id' => 1],
            ['marker' => 'admincare-demo-v1', 'updated_at' => now()],
        );

        // QR se excluye: DEMO_MODE bloquea su persistencia y generación.
        // Se excluyen tablas técnicas (migrations, jobs, sessions, cache y tokens);
        // permisos y roles sí se cargan porque son necesarios para autorizar la demo.
    }
}
