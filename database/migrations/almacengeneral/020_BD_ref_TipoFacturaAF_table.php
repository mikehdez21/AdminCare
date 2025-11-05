<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {

        // Crear la tabla de tipos de facturas de activos fijos dentro del esquema 'almacengeneral'
        Schema::create('almacengeneral.tableRef_TiposFacturasAF', function (Blueprint $table) {
            // Identificador único del tipo de movimiento (clave primaria)
            $table->bigIncrements('id_tipofacturaaf')->primary();

            // Nombre del tipo de fatura (cadena de texto, obligatorio)
            $table->string('nombre_tipofactura')->notNull();

            // Descripción del tipo de factura (cadena de texto, opcional)
            $table->string('descripcion_tipofactura')->nullable();

            // Campos de control: created_at y updated_at (automáticamente gestionados por Laravel)
            $table->timestamps();

        });

        DB::table('almacengeneral.tableRef_TiposFacturasAF')->insert([
            ['nombre_tipofactura' => 'Factura Electrónica', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_tipofactura' => 'Factura Manual', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_tipofactura' => 'Nota de Crédito', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_tipofactura' => 'Nota de Débito', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('almacengeneral.tableRef_TiposFacturasAF');
        // Opcional: eliminar el esquema 'almacengeneral' y todas sus tablas
        DB::statement('DROP SCHEMA IF EXISTS almacengeneral CASCADE');
    }
};
