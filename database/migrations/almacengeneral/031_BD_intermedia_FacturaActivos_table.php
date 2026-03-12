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
        Schema::create('almacengeneral.tableInter_FacturaActivos', function (Blueprint $table) {
            // ID de la factura (Clave primaria autoincremental)
            $table->bigIncrements('id_facturaactivos')->primary();

            // Clave foránea que referencia a la tabla de facturas en 'almacengeneral'
            $table->foreignId('id_factura')->constrained('almacengeneral.tableAF_Facturas', 'id_factura')->onDelete('restrict');

            // Clave foránea que referencia a la tabla de facturas en 'almacengeneral'
            $table->foreignId('id_activo_fijo')->constrained('almacengeneral.tableAF_ActivosFijos', 'id_activo_fijo')->onDelete('restrict');

            // Cantidad de activos fijos en la factura
            // $table->integer('cantidad_activos')->default(1);

            // Precio unitario del activo fijo en la factura
            $table->decimal('precio_unitarioaf', 21, 2)->nullable();

            // Descuento aplicado al activo fijo en la factura
            $table->decimal('descuento_af', 21, 2)->nullable();

            // Descuento porcentual aplicado al activo fijo en la factura
            $table->decimal('descuento_porcentajeaf', 5, 2)->nullable();

            // Observaciones adicionales sobre el detalle de la factura
            $table->text('observaciones_detalleaf')->nullable();

            // Campos de timestamps para registrar la fecha de creación y actualización de la factura
            $table->timestamps();

        });
    }

    public function down()
    {
        // Eliminar la tabla 'tableInter_FacturaActivos' en caso de revertir la migración
        Schema::dropIfExists('almacengeneral.tableInter_FacturaActivos');
    }
};
