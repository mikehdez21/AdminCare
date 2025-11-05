<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        // Crear el esquema 'almacengeneral' si no existe
        DB::statement('CREATE SCHEMA IF NOT EXISTS almacengeneral');

        // Crear la tabla 'af_facturas' dentro del esquema 'almacengeneral'
        Schema::create('almacengeneral.tableAF_Facturas', function (Blueprint $table) {
            // ID de la factura (Clave primaria autoincremental)
            $table->bigIncrements('id_factura')->primary();

            // Clave foránea que referencia a la tabla de proveedores en 'almacengeneral'
            $table->foreignId('id_proveedor')->constrained('almacengeneral.tableAF_Proveedores', 'id_proveedor')->onDelete('restrict');

            // Número de factura
            $table->string('num_factura');

            // Tipo de factura: Puede ser 'Factura' o 'Nota' / etc, no puede ser nulo
            $table->foreignId('id_tipo_factura')->constrained('almacengeneral.tableRef_TiposFacturasAF', 'id_tipofacturaaf')->onDelete('restrict');

            // Fecha en la que se emitió la factura, no puede ser nula
            $table->date('fecha_fac_emision')->notNull();

            // Fecha en la que se recibió la factura en el almacén (puede ser nula)
            $table->date('fecha_fac_recepcion')->notNull();

            // Relación con la tabla de formas de pago en el esquema 'almacengeneral'
            $table->foreignId('id_forma_pago')->constrained('almacengeneral.tableRef_FormasPago', 'id_formapago')->onDelete('set null');

            // Tipo de moneda en la que fue emitida la factura 
            $table->foreignId('id_tipo_moneda')->constrained('almacengeneral.tableRef_TiposMonedas', 'id_tipomoneda')->onDelete('set null');

            // Observaciones generales sobre la factura (puede ser nulo)
            $table->text('observaciones_factura')->nullable();

            // Subtotal de la factura (sin IVA ni descuentos), con precisión de 21 dígitos y 2 decimales
            $table->decimal('subtotal_factura', 21, 2);

            // Descuento aplicado en la factura (puede ser nulo)
            $table->decimal('descuento_factura', 21, 2)->nullable();

            // Costo del flete (transporte) incluido en la factura (puede ser nulo)
            $table->decimal('flete_factura', 21, 2)->nullable();

            // IVA aplicado a la factura
            $table->decimal('iva_factura', 21, 2);

            // Total de la factura (incluyendo impuestos y descuentos), con 21 dígitos y 2 decimales
            $table->decimal('total_factura', 21, 2);

            // Campos de timestamps para registrar la fecha de creación y actualización de la factura
            $table->timestamps();

            // Índices para mejorar el rendimiento de las consultas
            $table->index('num_factura', 'idx_num_factura');
            $table->index('fecha_fac_emision', 'idx_fecha_fac_emision'); 
            $table->index('fecha_fac_recepcion', 'idx_fecha_fac_recepcion'); 

        });
    }

    public function down()
    {
        // Eliminar la tabla 'tableAF_Facturas' en caso de revertir la migración
        Schema::dropIfExists('almacengeneral.tableAF_Facturas');
    }
};
