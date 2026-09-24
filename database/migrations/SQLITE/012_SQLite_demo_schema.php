<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 008 is the legacy PostgreSQL/production migration and is explicitly
        // skipped for SQLite by AppServiceProvider. This migration is the sole
        // owner of the portable SQLite locations table.
        if (Schema::getConnection()->getDriverName() !== 'sqlite') {
            return;
        }

        $catalogs = [
            ['tableRef_FormasPago', 'id_formapago', 'descripcion_formaspago'],
            ['tableRef_ClasificacionesAF', 'id_clasificacion', 'nombre_clasificacion'],
            ['tableRef_DescuentoProveedor', 'id_descuento_proveedor', 'descripcion_descuentoproveedor'],
            ['tableRef_TiposProveedor', 'id_tipoproveedor', 'descripcion_tipoproveedor'],
            ['tableRef_RegimenFiscales', 'id_regimenfiscal', 'descripcion_regimenfiscal'],
            ['tableRef_TiposFacturacion', 'id_tipofacturacion', 'descripcion_tipofacturacion'],
            ['tableRef_TiposMovimientosAF', 'id_tipomovimientoaf', 'nombre_tipomovimientoaf'],
            // Keep this catalog aligned with the PostgreSQL model and controllers.
            ['tableRef_TiposFacturasAF', 'id_tipofacturaaf', 'nombre_tipofactura'],
            ['tableRef_EstatusAF', 'id_estatusaf', 'descripcion_estatusaf'],
            ['tableRef_TiposMonedas', 'id_tipomoneda', 'descripcion_tipomoneda'],
            ['tableRef_EstatusDepreciacionAF', 'id_estatus_depreciacion', 'descripcion_estatus_depreciacion'],
        ];

        foreach ($catalogs as [$tableName, $key, $label]) {
            Schema::create($tableName, function (Blueprint $table) use ($tableName, $key, $label): void {
                $table->bigIncrements($key);
                $table->string($label, 255)->unique();
                if ($tableName === 'tableRef_TiposFacturasAF') {
                    $table->string('descripcion_tipofactura', 255)->nullable();
                }
                if ($label === 'nombre_clasificacion') {
                    $table->string('cuenta_contable')->nullable();
                }
                $table->boolean('estatus_activo')->default(true);
                $table->timestamps();
            });
        }

        Schema::create('tableRef_MetodosDepreciacion', function (Blueprint $table): void {
            $table->bigIncrements('id_metodo_depreciacion');
            $table->string('nombre_metodo', 100)->unique();
            $table->text('descripcion_metodo')->nullable();
            $table->string('formula', 500)->nullable();
            $table->decimal('tasa_default', 5, 2)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        Schema::create('tableUbicaciones', function (Blueprint $table): void {
            $table->bigIncrements('id_ubicacion');
            $table->string('nombre_ubicacion');
            $table->string('descripcion_ubicacion')->nullable();
            $table->boolean('estatus_activo')->default(true);
            $table->timestamps();
        });

        Schema::create('tableAF_Proveedores', function (Blueprint $table): void {
            $table->bigIncrements('id_proveedor');
            $table->string('nombre_proveedor');
            $table->string('razon_social');
            $table->string('email_proveedor')->unique();
            $table->string('telefono_proveedor')->nullable();
            $table->string('sitioWeb')->nullable();
            $table->string('rfc');
            $table->boolean('estatus_activo')->default(true);
            $table->unsignedBigInteger('id_tipo_moneda')->nullable();
            $table->unsignedBigInteger('id_tipo_proveedor')->nullable();
            $table->unsignedBigInteger('id_forma_pago')->nullable();
            $table->unsignedBigInteger('id_tipo_regimen')->nullable();
            $table->unsignedBigInteger('id_tipo_descuento')->nullable();
            $table->unsignedBigInteger('id_tipo_facturacion')->nullable();
            $table->timestamps();
            $table->foreign('id_tipo_moneda')->references('id_tipomoneda')->on('tableRef_TiposMonedas')->nullOnDelete();
            $table->foreign('id_tipo_proveedor')->references('id_tipoproveedor')->on('tableRef_TiposProveedor')->nullOnDelete();
            $table->foreign('id_forma_pago')->references('id_formapago')->on('tableRef_FormasPago')->nullOnDelete();
            $table->foreign('id_tipo_regimen')->references('id_regimenfiscal')->on('tableRef_RegimenFiscales')->nullOnDelete();
            $table->foreign('id_tipo_descuento')->references('id_descuento_proveedor')->on('tableRef_DescuentoProveedor')->nullOnDelete();
            $table->foreign('id_tipo_facturacion')->references('id_tipofacturacion')->on('tableRef_TiposFacturacion')->nullOnDelete();
        });

        Schema::create('tableAF_Facturas', function (Blueprint $table): void {
            $table->bigIncrements('id_factura');
            $table->unsignedBigInteger('id_proveedor');
            $table->string('num_factura');
            $table->unsignedBigInteger('id_tipo_factura');
            $table->dateTime('fecha_fac_recepcion');
            // Fecha en la que se realizó la compra (fecha que indica el proveedor en su factura).
            // Nullable: soporta guardar ediciones sin fecha de compra (D4-A).
            $table->date('fecha_fac_compra')->nullable();
            $table->unsignedBigInteger('id_forma_pago')->nullable();
            $table->unsignedBigInteger('id_tipo_moneda')->nullable();
            $table->text('observaciones_factura')->nullable();
            $table->decimal('subtotal_factura', 21, 2);
            $table->decimal('descuento_factura', 21, 2)->nullable();
            $table->decimal('flete_factura', 21, 2)->nullable();
            $table->decimal('iva_factura', 21, 2);
            $table->decimal('total_factura', 21, 2);
            $table->index('fecha_fac_compra', 'idx_fecha_fac_compra');
            $table->timestamps();
            $table->foreign('id_proveedor')->references('id_proveedor')->on('tableAF_Proveedores')->restrictOnDelete();
            $table->foreign('id_tipo_factura')->references('id_tipofacturaaf')->on('tableRef_TiposFacturasAF')->restrictOnDelete();
            $table->foreign('id_forma_pago')->references('id_formapago')->on('tableRef_FormasPago')->nullOnDelete();
            $table->foreign('id_tipo_moneda')->references('id_tipomoneda')->on('tableRef_TiposMonedas')->nullOnDelete();
        });

        Schema::create('tableAF_ActivosFijos', function (Blueprint $table): void {
            $table->bigIncrements('id_activo_fijo');
            $table->string('codigo_unico')->unique();
            $table->string('codigo_etiqueta', 150)->nullable()->unique();
            $table->string('codigo_lote', 100)->nullable();
            $table->unsignedInteger('lote_afconsecutivo')->nullable();
            $table->unsignedInteger('lote_total')->nullable();
            $table->string('nombre_af');
            $table->text('descripcion_af')->nullable();
            $table->string('modelo_af')->nullable();
            $table->string('marca_af')->nullable();
            $table->string('numero_serie_af')->nullable();
            $table->decimal('costo_unitario_af', 12, 2)->nullable();
            $table->boolean('af_propio')->default(true);
            $table->boolean('af_menor')->default(false);
            $table->unsignedBigInteger('id_estado_af')->default(1);
            $table->unsignedBigInteger('id_clasificacion')->nullable();
            $table->dateTime('fecha_registro_af');
            $table->boolean('depreciacion_aplicada')->default(false);
            $table->text('observaciones_af')->nullable();
            $table->timestamps();
            $table->foreign('id_estado_af')->references('id_estatusaf')->on('tableRef_EstatusAF')->restrictOnDelete();
            $table->foreign('id_clasificacion')->references('id_clasificacion')->on('tableRef_ClasificacionesAF')->nullOnDelete();
        });

        Schema::create('tableInter_FacturaActivos', function (Blueprint $table): void {
            $table->bigIncrements('id_facturaactivos');
            $table->unsignedBigInteger('id_factura');
            $table->unsignedBigInteger('id_activo_fijo');
            $table->decimal('descuento_af', 21, 2)->nullable();
            $table->decimal('descuento_porcentajeaf', 5, 2)->nullable();
            $table->text('observaciones_detalleaf')->nullable();
            $table->timestamps();
            $table->foreign('id_factura')->references('id_factura')->on('tableAF_Facturas')->restrictOnDelete();
            $table->foreign('id_activo_fijo')->references('id_activo_fijo')->on('tableAF_ActivosFijos')->restrictOnDelete();
        });

        Schema::create('tableAF_MovimientosActivos', function (Blueprint $table): void {
            $table->bigIncrements('id_movimientoAF');
            $table->unsignedBigInteger('id_activo_fijo');
            $table->unsignedBigInteger('id_tipo_movimiento');
            $table->string('motivo_movimiento')->nullable();
            $table->dateTime('fecha_movimiento')->nullable();
            $table->unsignedBigInteger('id_responsable_anterior')->nullable();
            $table->unsignedBigInteger('id_responsable_actual')->nullable();
            $table->unsignedBigInteger('id_ubicacion_anterior')->nullable();
            $table->unsignedBigInteger('id_ubicacion_actual')->nullable();
            $table->timestamps();
            $table->foreign('id_activo_fijo')->references('id_activo_fijo')->on('tableAF_ActivosFijos')->restrictOnDelete();
            $table->foreign('id_tipo_movimiento')->references('id_tipomovimientoaf')->on('tableRef_TiposMovimientosAF')->restrictOnDelete();
            $table->foreign('id_responsable_anterior')->references('id_empleado')->on('tableEmpleados')->nullOnDelete();
            $table->foreign('id_responsable_actual')->references('id_empleado')->on('tableEmpleados')->nullOnDelete();
            $table->foreign('id_ubicacion_anterior')->references('id_ubicacion')->on('tableUbicaciones')->nullOnDelete();
            $table->foreign('id_ubicacion_actual')->references('id_ubicacion')->on('tableUbicaciones')->nullOnDelete();
        });

        Schema::create('tableAF_CodigosQR', function (Blueprint $table): void {
            $table->bigIncrements('id_qraf');
            $table->unsignedBigInteger('id_activo_fijo')->unique();
            $table->string('codigo_qr', 100)->unique();
            $table->string('url_destino', 500);
            $table->dateTime('fecha_generacion')->nullable();
            $table->dateTime('fecha_ultimo_escaneo')->nullable();
            $table->boolean('activo')->default(true);
            $table->unsignedInteger('intentos_lectura')->default(0);
            $table->text('observaciones')->nullable();
            $table->timestamps();
            $table->foreign('id_activo_fijo')->references('id_activo_fijo')->on('tableAF_ActivosFijos')->cascadeOnDelete();
        });

        Schema::create('tableAF_DepreciacionActivo', function (Blueprint $table): void {
            $table->bigIncrements('id_depreciacionaf');
            $table->unsignedBigInteger('id_activo_fijo');
            $table->unsignedBigInteger('id_metodo_depreciacionaf')->nullable();
            $table->unsignedBigInteger('id_estatus_depreciacion');
            $table->integer('anio_depreciacionaf');
            $table->decimal('valor_inicialaf', 21, 2);
            $table->decimal('valor_depreciacion_anterior', 21, 2)->default(0);
            $table->decimal('valor_depreciacion_acumulada', 21, 2);
            $table->decimal('valor_depreciacion_anual', 21, 2);
            $table->decimal('valor_libros_af', 21, 2);
            $table->date('fecha_inicio_depreciacion')->nullable();
            $table->integer('vida_util_anios')->nullable();
            $table->decimal('valor_residual_af', 21, 2)->default(0);
            $table->unsignedBigInteger('id_usuario_calculo')->nullable();
            $table->text('observaciones_depreciacionaf')->nullable();
            $table->date('fecha_calculo_depreciacion');
            $table->timestamps();
            $table->foreign('id_activo_fijo')->references('id_activo_fijo')->on('tableAF_ActivosFijos')->cascadeOnDelete();
            $table->foreign('id_metodo_depreciacionaf')->references('id_metodo_depreciacion')->on('tableRef_MetodosDepreciacion')->nullOnDelete();
            $table->foreign('id_estatus_depreciacion')->references('id_estatus_depreciacion')->on('tableRef_EstatusDepreciacionAF')->nullOnDelete();
            $table->foreign('id_usuario_calculo')->references('id_usuario')->on('tableUsuarios')->nullOnDelete();
            $table->unique(['id_activo_fijo', 'anio_depreciacionaf'], 'uk_activo_anio_deprec');
        });
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'sqlite') {
            return;
        }

        foreach ([
            'tableAF_DepreciacionActivo', 'tableAF_CodigosQR', 'tableAF_MovimientosActivos',
            'tableInter_FacturaActivos', 'tableAF_ActivosFijos', 'tableAF_Facturas',
            'tableAF_Proveedores', 'tableUbicaciones', 'tableRef_MetodosDepreciacion', 'tableRef_EstatusDepreciacionAF',
            'tableRef_TiposMonedas', 'tableRef_EstatusAF', 'tableRef_TiposFacturasAF',
            'tableRef_TiposMovimientosAF', 'tableRef_TiposFacturacion', 'tableRef_RegimenFiscales',
            'tableRef_TiposProveedor', 'tableRef_DescuentoProveedor', 'tableRef_ClasificacionesAF',
            'tableRef_FormasPago',
        ] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
